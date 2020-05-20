const debug = require('debug')('pp:calcGroups');
const optsize = require('./opt-size');
const calcGroups = (total, maxNum, groupNum) => {
  const transforms = new Map();
  let curGroups = [];
  let nextGroups = [];
  const groups = optsize(total, groupNum ? groupNum : maxNum, groupNum);
  for (const [rawSize, num] of Object.entries(groups)) {
    const size = parseInt(rawSize, 10);
    let i = -1;
    while (++i < num) {
      curGroups.push(size);
    }
  }
  while (curGroups.length > 1) {
    curGroups.sort();
    while (curGroups.length) {
      if (curGroups.length === 3) {
        const sum = curGroups[0] + curGroups[1] + curGroups[2];
        if (!transforms.has(sum)) {
          transforms.set(sum, [])
        }
        transforms.get(sum).push(curGroups)
        curGroups = [];
        nextGroups.push(sum)
      } else {
        let b = curGroups.pop();
        let a = curGroups.pop();
        const sum = a + b;
        if (!transforms.has(sum)) {
          transforms.set(sum, [])
        }
        transforms.get(sum).push([a, b])
        nextGroups.push(sum)
      }
    }
    curGroups = nextGroups;
    nextGroups = [];
  }
  return transforms;
}
module.exports = calcGroups;
