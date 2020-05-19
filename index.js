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
  if (!opts) {
    opts = {};
  }
  const ourOpts = Object.assign({}, defauts, obj);
  switch (opts.algo) {
    case 'spaceFillingCurve':
    case 'sfc':
      return spaceFillingCurve(array.slice(), ourOpts)
    case 'kmeans':
    case 'k-means':
      return kmeans(array, ourOpts)
    case 'rtree':
      return rtree(array, ourOpts.maxNumber, ourOpts.getCoord)
    case 'rtree-plus':
    case 'rtree+':
      return rtree(array, ourOpts.maxNumber, ourOpts.getCoord, true)
    default: throw new Error(`unknown algorhthem: ${algo}`)
  }
}
