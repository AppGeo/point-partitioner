const clustersKmeans = require('@turf/clusters-kmeans').default;

const kmeans = (items, opts) => {
  const thing = {
    type: 'FeatureCollection',
    features: items.map(item=> {
      const geometry = opts.getCoords(item)
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
  const groups = opts.groups || Math.trunc(len/opts.maxNumber) + 1;
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
