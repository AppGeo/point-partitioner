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
class MergedPoints {
  constructor(point) {
    this.points = [point];
    this[sizeSym] = point[sizeSym];
    this[cordSym] = point[cordSym];
  }
  add(point) {
    if (point instanceof MergedPoints) {
      this.points.push(...point.points)
    } else {
      this.points.push(point);
    }
    this[sizeSym] += point[sizeSym];
    return this;
  }
}
const mergeItems = (a, b) => {
  if (!(a instanceof MergedPoints)) {
    a = new MergedPoints(a);
  }
  return a.add(b);
}
const makeGetSize= (getSize, mergeDups) => {
  if (getSize === defaultGetSize && !mergeDups) {
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
const makeGetLength = (getSize, mergeDups) => {
  if (getSize === defaultGetSize && !mergeDups) {
    return arr => arr.length;
  }
  return (arr) => {
    if (getSize === defaultGetSize && !mergeDups) {
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
const unMerge = items => {
  if (!items.some(item => item instanceof MergedPoints)) {
    return items;
  }
  const out = [];
  for (const item of items) {
    if (item instanceof MergedPoints) {
      out.push(...item.points)
    } else {
      out.push(item);
    }
  }
  return out;
}
const slice = (items, transforms, getSize, getLength, mergeDups) => {
  const rawtransform = transforms.get(getLength(items));
  const transform = rawtransform.pop();
  if (!rawtransform.length) {
    transforms.delete(getLength(items));
  }
  if (getSize === defaultGetSize && !mergeDups) {
    return basicSlice(items, transform);
  }
  let i = 0;
  const out = transform.map((size) => {
    const thing = [];
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
        curArrSize -= prevSize;
        nextArrSize += prevSize;
        nextArr.push(prev);
      }
      arr.push(next);
    }
  }
  out[out.length - 1].push(...items.slice(i));
  if (mergeDups) {
    return out.map(arr=>unMerge(arr));
  }
  return out;
}
const merge = (items, getCoords) => {
  let i = 0;
  let triggered = false;
  while (++i < items.length) {
    const prevItem = items[i - 1];
    const curItem = items[i];
    const prevCoord = getCoords(prevItem);
    const curCoord = getCoords(curItem);
    if (
      prevCoord[0] === curCoord[0]
      && prevCoord[1] === curCoord[1]
    ) {
      items[i] = mergeItems(prevItem, curItem);
      items[i - 1] = false;
      triggered = true;
    }
  }
  if (triggered) {
    return items.filter(item=>item);
  }
  return items;
}
const sort = (items, getCoords, first) => {
  const bounds = calculateBounds(items, getCoords);
  const xDif = bounds[2] - bounds[0];
  const yDif = bounds[3] - bounds[1];
  if (xDif > yDif) {
    items.sort(sortX);
  } else {
    items.sort(sortY);
  }
  if (first) {
    return merge(items, getCoords)
  }
  return items;
}
const rtree = (items, opts) => {
  const getCoords = makeGetCoords(opts.getCoord, opts.mergeDups);
  const getSize = makeGetSize(opts.getSize, opts.mergeDups);
  const getLength = makeGetLength(getSize, opts.mergeDups);
  const size = getLength(items);
  const transforms = calculateGroups(size, opts.maxNumber, opts.groups);
  const toDo = [items];
  const done = [];
  let first = opts.mergeDups;
  while (toDo.length) {
    let cur = toDo.pop();
    if (!transforms.has(getLength(cur))) {
      done.push(cur);
      continue;
    }
    cur = sort(cur, getCoords, first);
    if (first) {
      first = false;
    }
    toDo.push(...slice(cur, transforms, getSize, getLength, opts.mergeDups));
  }
  return done;
}
module.exports = rtree
