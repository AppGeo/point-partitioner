const optimalGroups = (total, num, useGroups) => {
  if (useGroups && num >= total) {
    return {
      1: total
    }
  }
  const transforms = {}
  const rem = total % num;
  if (!rem) {
    let groups, size;
    if (useGroups) {
      groups = num;
      size = total/num;
    } else {
      size = num;
      groups = total/num
    }
    return {
      [size]: groups
    }
  }
  let groups = useGroups ? num : Math.trunc(total/num) + 1;
  let min = Math.trunc(total/groups);
  let overhang = total - (groups * min);
  while (groups--) {
    let cur;
    if (overhang-- > 0) {
      cur = min + 1;
    } else {
      cur = min;
    }
    if (!transforms[cur]) {
      transforms[cur] = 0;
    }
    transforms[cur]++
  }
  return transforms;
}
module.exports = optimalGroups;
