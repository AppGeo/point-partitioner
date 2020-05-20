const spaceFillingCurve = require('./space-filling');
const kmeans = require('./k-means');
const rtree = require('./rtree');
const { getGeojsonCoord, getSize } = require('./constants');
const defaults = {
  algo: 'spaceFillingCurve',
  getCoord: getGeojsonCoord,
  maxNumber: 10,
  getSize
}
module.exports = (array, obj, _) => {
  if (typeof obj === 'number') {
    let num = obj;
    obj = _ || {}
    obj.maxNumber = num;
  }
  if (!obj) {
    obj = {};
  }
  const opts = Object.assign({}, defaults, obj);
  switch (opts.algo) {
    case 'spaceFillingCurve':
    case 'sfc':
      return spaceFillingCurve(array.slice(), opts)
    case 'kmeans':
    case 'k-means':
      return kmeans(array, opts)
    case 'rtree':
    case 'rtree-plus':
    case 'rtree+':
      return rtree(array.slice(), opts)
    default: throw new Error(`unknown algorhthem: ${opts.algo}`)
  }
}
