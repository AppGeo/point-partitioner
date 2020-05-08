const spaceFillingCurve = require('./space-filling');
const kmeans = require('./k-means');
const rtree = require('./rtree');
const getGeojsonCoord = item => item.geometry.coordinates

module.exports = (array, num, opts={}) => {
  const algo = opts.algo || 'spaceFillingCurve';
  const getCoord = opts.getCoord || getGeojsonCoord;
  switch (algo) {
    case 'spaceFillingCurve':
    case 'sfc':
      return spaceFillingCurve(array.slice(), 10, getCoord)
    case 'kmeans':
    case 'k-means':
      return kmeans(array, 10, getCoord)
    case 'rtree':
      return rtree(array, 10, getCoord)
    case 'rtree-plus':
    case 'rtree+':
      return rtree(array, 10, getCoord, true)
    default: throw new Error(`unknown algorhthem: ${algo}`)
  }
}
