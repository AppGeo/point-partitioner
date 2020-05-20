const test = require('tape-catch');
const {randomPosition, randomPoint} = require('@turf/random');
const pp = require('./');
const optimalGroups = require('./opt-size')
const algos = ['rtree', 'sfc'];
const options = [
  {
    size: 100,
    num: 10,
    groups: false
  },
  {
    size: 100,
    num: 10,
    groups: true
  }
]
let startSize = 50;
let maxSize = 500;
while (startSize < maxSize) {
  let maxMaxSize = 52;
  let minMaxSize = 2;
  while (minMaxSize < maxMaxSize) {
    options.push({
      size: startSize,
      num: minMaxSize,
      groups: false
    })
    options.push({
      size: startSize,
      num: minMaxSize,
      groups: true
    })

    minMaxSize++;
  }
  startSize++;
}
const rollup = arr => {
  const out = {};
  for (const item of arr) {
    const len = item.length;
    if (!out[len]) {
      out[len] = 0;
    }
    out[len]++;
  }
  return out;
}
test('basic sizes', t => {
  const getCoord = item => item;
  const createArr = size => {
    const out = [];
    while (out.length < size) {
      out.push(randomPosition([-180, -90, 180, 90]));
    }
    return out;
  }
  t.test('legecy opts 1', t => {
      t.plan(1);
      const input = createArr(100);
      const out = pp(input, 10, {
        getCoord
      })
      t.deepEqual(rollup(out), {10:10}, 'correct distribution')
  })
  t.test('legecy opts 2', t => {
      t.plan(1);
      const input = randomPoint(100, {bbox: [-180, -90, 180, 90]}).features;
      const out = pp(input, 10)
      t.deepEqual(rollup(out), {10:10}, 'correct distribution')
  })
  for (const algo of algos) {
    for (const option of options) {
      t.test(`${algo}: size: ${option.size}. ${option.groups ? 'groups': 'maxSize:'} ${option.num}`, t=> {
        t.plan(1);
        const input = createArr(option.size);
        const opts = {
          getCoord,
          algo
        }
        if (option.groups) {
          opts.groups = option.num
        } else {
          opts.maxNumber = option.num
        };
        const out = pp(input, opts);
        t.deepEqual(rollup(out), optimalGroups(option.size, option.num, option.groups), 'correct distribution')
      })
    }
  }
});
