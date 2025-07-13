export class NumberUtility {
  getRandomIntegerNumber(fromInclusive, toExclusive) {
    if (typeof fromInclusive !== 'number' || typeof toExclusive !== 'number') {
      throw new TypeError('Parameters should be numbers');
    }
    if (fromInclusive >= toExclusive) {
      throw new RangeError('fromInclusive must be less than toExclusive');
    }
    return Math.floor(Math.random() * (toExclusive - fromInclusive) + fromInclusive);
  }
}
