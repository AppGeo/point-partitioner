const fixLat = lat => Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
const calculateBounds = require('./calculate-bounds');
const calculateGroups = require('./calc-groups');
const { getSize: defaultGetSize } = require('./constants');
const cordSym = Symbol('r-coordinates')
const makeGetCoords = (getCoords) => (item) => {
  if (!item[cordSym]) {
     let coords = getCoords(item);
     item[cordSym] = [coords[0], fixLat(coords[1])];
  }
  return item[cordSym];
}
const sizeSym = Symbol('r-size')

const makeGetSize= (getSize) => {
  if (getSize === defaultGetSize) {
    return getSize;
  }
  return (item) => {
    if (!item[sizeSym]) {
      item[sizeSym] = getSize(item);
    }
    return item[sizeSym];
  }
}
const lenSym = Symbol('r-length')
const makeGetLength = (getSize) => {
  if (getSize === defaultGetSize) {
    return arr => arr.length;
  }
  return (arr) => {
    if (getSize === defaultGetSize) {
      return arr.length;
    }
    if (!arr[lenSym]) {
      arr[lenSym] = arr.reduce((acc, item) => acc + getSize(item), 0);
    }
    return arr[lenSym]
  }
}
const sortX = (a, b) => a[cordSym][0] - b[cordSym][0];
const sortY = (a, b) => a[cordSym][1] - b[cordSym][1];

const basicSlice = (items, sizes) => {
  if (sizes.length === 2) {
    return [
      items.slice(0, sizes[0]),
      items.slice(sizes[0])
    ];
  }
  return [
    items.slice(0, sizes[0]),
    items.slice(sizes[0], -sizes[2]),
    items.slice(-sizes[2])
  ];
}
const slice = (items, transforms, getSize, getLength) => {
  const transform = transforms.get(getLength(items));
  if (getSize === defaultGetSize) {
    return basicSlice(items, transform);
  }
  let i = 0;
  const out = transform.map((size) => {
    const thing = [];
    thing[lenSym] = size;
    return thing;
  });
  let k = -1;
  let nextArrSize = 0;
  while (++k < transform.length - 1 && i < items.length) {
    const arr = out[k];
    const outSize = transform[k];
    const nextArr = out[k + 1];
    let curArrSize = nextArrSize;
    nextArrSize = 0;
    while (curArrSize < outSize && i < items.length) {
      const next = items[i++];
      const nextSize = getSize(next);
      curArrSize += nextSize;
      while (curArrSize > outSize && arr.length) {
        const prev = arr.pop();
        const prevSize = getSize(prev);
        j -= prevSize;
        nextArrSize += prevSize;
        nextArr.push(prev);
      }
      arr.push(next);
    }
  }
  out[out.length - 1].push(...items.slice(i));
  return out;
}
const sort = (items, getCoords) => {
  const bounds = calculateBounds(items, getCoords);
  const xDif = bounds[2] - bounds[0];
  const yDif = bounds[3] - bounds[1];
  if (xDif > yDif) {
    items.sort(sortX);
  } else {
    items.sort(sortY);
  }
}
const rtree = (items, opts) => {
  const getCoords = makeGetCoords(opts.getCoord);
  const getSize = makeGetSize(opts.getSize);
  const getLength = makeGetLength(getSize);
  const size = getLength(items);
  const transforms = calculateGroups(size, opts.maxNumber, opts.groups);
  const toDo = [items];
  const done = [];
  while (toDo.length) {
    const cur = toDo.pop();
    // console.log(cur.length);
    if (!transforms.has(getLength(cur))) {
      done.push(cur);
      continue;
    }
    sort(cur, getCoords)
    toDo.push(...slice(cur, transforms, getSize, getLength));
  }
  return done;
}
module.exports = rtree
