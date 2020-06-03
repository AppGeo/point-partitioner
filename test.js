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
let startSize = 100;
let maxSize = 200;
while (startSize < maxSize) {
  let maxMaxSize = 25;
  let minMaxSize = 10;
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
const generateSizeStuff = num => {
  return randomPoint(num, {bbox: [-180, -90, 180, 90]}).features.map((item, i) => {
    item.properties.size = (i % 6) + 1
    return item;
  })
}
test('sizes', t => {
  const getSize = item => item.properties.size;
  t.test('sfc sizes, maxNum', t => {
    const stuff = generateSizeStuff(500);
    const out = pp(stuff, {
      getSize,
      maxNumber: 30,
      algo: 'sfc'
    });
    console.log('items', out.map(item=>item.length))
    console.log('sizes', out.map(item=>item.reduce((acc, item)=> acc + item.properties.size, 0)))
    t.end();
  })
  t.test('sfc sizes, groups', t => {
    const stuff = generateSizeStuff(500);
    const out = pp(stuff, {
      getSize,
      groups: 10,
      algo: 'sfc'
    });
    console.log('items', out.map(item=>item.length))
    console.log('sizes', out.map(item=>item.reduce((acc, item)=> acc + item.properties.size, 0)))
    t.end();
  })
  t.test('rtree sizes, maxNum', t => {
    const stuff = generateSizeStuff(500);
    const out = pp(stuff, {
      getSize,
      maxNumber: 30,
      algo: 'rtree'
    });
    console.log('items', out.map(item=>item.length))
    console.log('sizes', out.map(item=>item.reduce((acc, item)=> acc + item.properties.size, 0)))
    t.end();
  })
  t.test('rtree sizes, groups', t => {
    const stuff = generateSizeStuff(500);
    const out = pp(stuff, {
      getSize,
      groups: 10,
      algo: 'rtree'
    });
    console.log('items', out.map(item=>item.length))
    console.log('sizes', out.map(item=>item.reduce((acc, item)=> acc + item.properties.size, 0)))
    t.end();
  })
})
test.skip('basic sizes', t => {
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
test('duplicates', t => {
  const getCoord = item => item;
  const createArr = size => {
    const out = [];
    let flip = false;
    while (out.length < size) {
      const position = randomPosition([-180, -90, 180, 90])
      if (flip && out.length + 1 < size) {
        out.push(position, position);
      } else {
        out.push(position);
      }
      flip = !flip;
    }
    return out;
  }
  t.test('dup points', t => {
      t.plan(1);
      const input = createArr(100);
      const out = pp(input, {
        maxNumber: 10,
        algo: 'rtree',
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
})
