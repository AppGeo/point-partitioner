const min = (a, b) => {
  if (b > a) {
    return true
  } else {
    return false
  }
}
const calculateBounds = (arr, getCoords) => {
  const out = [Infinity, Infinity, -Infinity, -Infinity];
  for (const item of arr) {
    const [x, y] = getCoords(item);
    if (min(x, out[0])) {
      out[0] = x;
    }
    if (min(y, out[1])) {
      out[1] = y;
    }
    if (min(out[2], x)) {
      out[2] = x;
    }
    if (min(out[3], y)) {
      out[3] = y;
    }
  }
  return out;
}

module.exports = calculateBounds;
