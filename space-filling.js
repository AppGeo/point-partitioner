const nontree = require('nontree/lib/nontree');
const calculateBounds = require('./calculate-bounds');

const _getCoords = item=> item.coordinates;

const cordSym = Symbol('coordinates')
const MAX_DEPTH = 25;
const makeGetCoords = (getCoords = _getCoords) => (item) => {
  if (!item[cordSym]) {
    item[cordSym] = getCoords(item);
  }
  return item[cordSym];
}



const partitionEasy = (items, size) => {
  const out = [];
  let i = -1;
  let j = -1;
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
const partition = (items, size) => {
  const rem = items.length % size;
  if (!rem) {
    return partitionEasy(items, size);
  }
  if (items.length < size) {
    return [items];
  }
  const groups = Math.trunc(items.length/size) + 1;
  const min = Math.trunc(items.length/groups);
  const overhang = items.length - (groups * min);
  const out = [];
  let i = 0;
  let cur = [];
  const getSize = () => {
    if (out.length < overhang) {
      return min + 1;
    }
    return min;
  }
  for (const item of items) {
    cur.push(item);
    if (cur.length === getSize()) {
      out.push(cur);
      cur = []
    }
  }
  if (cur.length) {
    out.push(cur);
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
const spaceFillingCurve = (items, size, _getCoords) => {
  const getCoords = makeGetCoords(_getCoords)
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
  return partition(items, size);
}
module.exports = spaceFillingCurve;
module.exports.spaceKey = spaceKey
module.exports.partition = partition
