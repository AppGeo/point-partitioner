# point-partitioner


## Api

```
const outputArray = partitioner(inputArray, num, opts);
```
- inputArray: array of input items (defaults to geojson point features)
- num: max number of points per group
- opts: config object, optional, currently takes
  - algo: which algorithm to use, currently the default is 'spaceFillingCurve', other options are 'k-mean', 'rtree', and 'rtree-plus'
  - getCoord: function to find the coordinates for the object, must return an array of `[x,y]`, default is `item => item.geometry.coordinates`
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

Figures out whether the horizontal or vertical access is wider, sorts by that coordiante
and then splits the dataset in half.  The algorithm does this recursivly until all groups are smaller then the max.
Depending on the num provided and the input length it can sometimes provide output
in groups of size num/2 + 1

## rtree-plus

Alias `rtree+`,

Similar to rtree but will occasionally divide into thirds to get a better sized output.
