const fixLat = lat => Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
const calculateBounds = require('./calculate-bounds');
const cordSym = Symbol('r-coordinates')
const makeGetCoords = (getCoords) => (item) => {
  if (!item[cordSym]) {
     let coords = getCoords(item);
     item[cordSym] = [coords[0], fixLat(coords[1])];
  }
  return item[cordSym];
}
const sortX = (a, b) => a[cordSym][0] - b[cordSym][0];
const sortY = (a, b) => a[cordSym][1] - b[cordSym][1];
const slice = (items, size, thirds) => {
  const pivit = items.length >>> 1;
  // console.log('third', size, items.length);
  if (items.length > (size * 4) && items.length <= (size * 6) && thirds) {
    // console.log('top')
    const third = Math.round(items.length/3);
    return [
      items.slice(0, third),
      items.slice(third, -third),
      items.slice(-third)
    ]
  }
  // console.log('bottom');
  return [
   items.slice(0, pivit),
   items.slice(pivit)
 ]
}
const split = (items, size, getCoords, thirds) => {
  const bounds = calculateBounds(items, getCoords);
  const xDif = bounds[2] - bounds[0];
  const yDif = bounds[3] - bounds[1];
  if (xDif > yDif) {
    items.sort(sortX);
  } else {
    items.sort(sortY);
  }

  return slice(items, size, thirds)
}
const rtree = (items, size, _getCoords, thirds) => {
  const getCoords = makeGetCoords(_getCoords)
  const toDo = [items.slice()];
  const done = [];
  while (toDo.length) {
    const cur = toDo.pop();
    // console.log(cur.length);
    if (cur.length<= size) {
      done.push(cur);
      continue;
    }
    toDo.push(...split(cur, size, getCoords, thirds));
  }
  return done;
}
module.exports = rtree
