# cluster


## Api

```
const outputArray = cluster(inputArray, num, opts);
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

## k-mean

Alias `kmean`,

## rtree

## rtree-plus

Alias `rtree+`, 
