const optimalGroups = require('./opt-size')
const total = parseInt(process.argv[2], 10);
const num = parseInt(process.argv[3], 10);
const useGroups = Boolean(process.argv[4]);
console.log(optimalGroups(total, num, useGroups));
