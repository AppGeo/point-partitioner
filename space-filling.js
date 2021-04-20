const nontree = require('nontree/lib/nontree');
const calculateBounds = require('./calculate-bounds');
const { getSize: defaultGetSize } = require('./constants');

const cordSym = Symbol('coordinates')
const MAX_DEPTH = 25;
const makeGetCoords = (getCoords) => (item) => {
  if (!item[cordSym]) {
    item[cordSym] = getCoords(item);
  }
  return item[cordSym];
}
const sizeSym = Symbol('size')
const groupSizeSym = Symbol('groupSize')
const makeGetSize= (getSize) => (item) => {
  if (!item[sizeSym]) {
    item[sizeSym] = getSize(item);
  }
  return item[sizeSym];
}

const partitionEasy = (items, size) => {
  const out = [];
  let cur = [];
  for (const item of items) {
    cur.push(item);
    if (cur.length === size) {
      out.push(cur);
      cur = []
    }
  }
  if (cur.length) {
    out.push(cur);
  }
  return out;
}
const partitionNormal = (items, size, useGroups) => {
  if (useGroups && size >= items.length) {
    return items.map(item => [item]);
  }
  const rem = items.length % size;
  if (!rem) {
    if (useGroups) {
      return partitionEasy(items, items.length / size);
    }
    return partitionEasy(items, size);
  }
  if (!useGroups && items.length < size) {
    return [items];
  }
  const groups = useGroups ? size : Math.trunc(items.length/size) + 1;
  const min = Math.trunc(items.length/groups);
  const overhang = items.length - (groups * min);
  const out = [];
  let i = 0;
  let cur = [];
  const getRightSize = () => {
    if (out.length < overhang) {
      return min + 1;
    }
    return min;
  }
  for (const item of items) {
    cur.push(item);
    if (cur.length === getRightSize()) {
      out.push(cur);
      cur = []
    }
  }
  if (cur.length) {
    out.push(cur);
  }
  return out;
}
const makeGetGroupSize = getSize => arr => {
  if (arr[groupSizeSym]) {
    return arr[groupSizeSym];
  }
  const size = arr.reduce((acc, item)=> acc + getSize(item), 0);
  arr[groupSizeSym] = size;
  return size;
}
const partition = (items, size, _getSize, useGroups) => {
  if (_getSize === defaultGetSize) {
    return partitionNormal(items, size, useGroups)
  }
  const getSize = makeGetSize(_getSize);
  const length = items.reduce((acc, item) => acc + getSize(item), 0);
  if (length < size) {
    if (useGroups) {
      return items.map(item => [item]);
    }
    return [items];
  }
  const rem = length % size;
  const out = [];
  let getRightSize;
  if (!rem) {
    if (useGroups) {
      const thisSize = length/size;
      getRightSize = () => {
        return thisSize
      }
    } else {
      getRightSize = () => {
        return size
      }
    }
  } else {
    const groups = useGroups ? size : Math.trunc(length/size) + 1;
    const min = Math.trunc(length/groups);
    const overhang = length - (groups * min);
    getRightSize = () => {
      if (out.length < overhang) {
        return min + 1;
      }
      return min;
    }
  }
  let cur = [];
  let next = [];
  let nextLen = 0;
  let curLen = 0;
  for (const item of items) {
    const itemSize = getSize(item);
    if (itemSize >= getRightSize()) {
      out.push([item]);
      continue;
    }
    curLen += itemSize;

    while (curLen > getRightSize()) {
      const outItem = cur.pop();
      const outLen = getSize(outItem);
      next.push(outItem);
      curLen -= outLen;
      nextLen += outLen;
    }
    cur.push(item);
    if (curLen >=  getRightSize()) {
      out.push(cur);
      cur = next;
      curLen = nextLen;
      next = [];
      nextLen = 0;
    }
  }
  while (nextLen) {
    cur = next;
    curLen = nextLen;
    next = [];
    nextLen = 0;
    while (curLen > getRightSize()) {
      const outItem = cur.pop();
      const outLen = getSize(outItem);
      next.push(outItem);
      curLen -= outLen;
      nextLen += outLen;
    }
    if (cur.length) {
      out.push(cur);
    }
    cur = [];
  }
  if (cur.length) {
    out.push(cur);
  }

  if (!useGroups) {
    return out;
  }
  if (out.length <= size) {
    return out;
  }
  const getGroupSize = makeGetGroupSize(getSize);
  for (const item of out) {
    getGroupSize(item);
  }
  while (out.length > size) {
    out.sort((a, b)=>b[groupSizeSym] - a[groupSizeSym])
    const smallest = out.pop();
    const penesmallest = out.pop();
    const newThing = [];
    newThing.push(...penesmallest);
    newThing.push(...smallest);
    getGroupSize(newThing);
    out.push(newThing);
  }
  return out;
}
const spaceKey = Symbol('spaceKey');

const fixDups = (dups, bounds) => {
  const sortedDups = new Map();
  for (let item of dups) {
    if (item[spaceKey].length >= MAX_DEPTH) {
      continue;
    }
    if (!sortedDups.has(item[spaceKey])) {
      sortedDups.set(item[spaceKey], [])
    }
    let oldSort = sortedDups.get(item[spaceKey]);
    oldSort.push(item);
    sortedDups.set(item[spaceKey], oldSort);
  }
  for ([key, arr] of sortedDups) {
    if (arr.length === 1) {
      continue;
    }
    for (const item of arr) {
      item[spaceKey] = nontree.toNon(item[cordSym], item[spaceKey].length + 1, bounds);
    }
    fixDups(arr, bounds);
  }
}

const sort = items => {
  let dups = new Set();
  items.sort((a, b) => {
    if (a[spaceKey] > b[spaceKey]) {
      return 1;
    }
    if (a[spaceKey] === b[spaceKey]) {
      if (a[spaceKey].length < MAX_DEPTH) {
        dups.add(a);
        dups.add(b);
      }
      return 0;
    }
    return -1;
  });
  return dups;
}
const spaceFillingCurve = (items, opts) => {
  const getCoords = makeGetCoords(opts.getCoord)
  const bounds = calculateBounds(items, getCoords);
  for (const item of items) {
    item[spaceKey] = nontree.toNon(getCoords(item), 5, bounds);
  }

  const dups = sort(items)
  if (dups.size) {
    fixDups(dups, bounds);
  }
  if (sort(items).size) {
    throw new Error('should not still have duplicates');
  }
  if (opts.groups) {
    return partition(items, opts.groups, opts.getSize, true)
  }
  return partition(items, opts.maxNumber, opts.getSize);
}
module.exports = spaceFillingCurve;
module.exports.spaceKey = spaceKey
module.exports.partition = partition
