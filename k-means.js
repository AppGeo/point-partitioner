const clustersKmeans = require('@turf/clusters-kmeans').default;

const kmeans = (items, size, getCoords) => {
  const thing = {
    type: 'FeatureCollection',
    features: items.map(item=> {
      const geometry = getCoords(item)
      if (!geometry) {
        return;
      }
      return {
        type: 'Feature',
        properties: {
          orig: item
        },
        geometry: {
          type: 'Point',
          coordinates: geometry
        }
      }

    }).filter(item=>item)
  }
  const len = thing.features.length;
  const groups = Math.trunc(len/size) + 1;
  clustersKmeans(thing, {
    numberOfClusters: groups,
    mutate:  true
  })
  const out = [];
  for (const feature of thing.features) {
    const cluster = feature.properties.cluster;
    if (!out[cluster]) {
      out[cluster] = [];
    }
    out[cluster].push(feature.properties.orig);
  }
  return out;
}
module.exports = kmeans;
