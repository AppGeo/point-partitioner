# point-partitioner


## Api

```
const outputArray = partitioner(inputArray, opts);
```
- inputArray: array of input items (defaults to geojson point features)
- opts: config object, optional, currently takes
  - algo: which algorithm to use, currently the default is 'spaceFillingCurve', other options are 'k-mean', 'rtree', and 'rtree-plus'
  - getCoord: function to find the coordinates for the object, must return an array of `[x,y]`, default is `item => item.geometry.coordinates`
  - maxNumber: the maximum number of objects in the groups (can not be combined with groups)
  - groups: number of groups to create (can not be combined with maxNumber).
  - getSize: use this function to give relative sizes to different entities, defaults to `()=>1`.  Currently k-mean ignores this, works best with space filling curve.
  - mergeDups: treats points with identical coordinates as a single point with a size of 2, or put another way, avoids splitting up identical points.  Only works with rtree.
- outputArray: same as inputArray but divided into sub arrays of no more then num


# algorithms

## spaceFillingCurve

Alias `sfc`,

Plots the points on a [peano curve](https://en.wikipedia.org/wiki/Peano_curve),
than sorts and partitions into arrays no bigger then the number supplied.  Of
all the algorithms this one will provided the most optimally sized output arrays.
It relies on the [nontree](https://github.com/calvinmetcalf/nontree), see it for
details.  

## k-mean

Alias `kmean`,

K-means clustering from [turf](https://www.npmjs.com/package/@turf/clusters-kmeans)
uses the input length and num to figure out the number of output clusters, clusters themselves
are going to be wildly different sizes.


## rtree

Figures out whether the horizontal or vertical access is wider, sorts by that coordinate
and then splits the dataset.  The algorithm does this recursivly until all groups are smaller then the max.
When used with getSize weird results can occasionally happen.
