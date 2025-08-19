import { NumberUtility } from '../src/shared/utils/number-utility.js';


describe('Number Utility', () => {
  let randomNumber;

  beforeEach(() => {
    randomNumber = new NumberUtility();
  });

  describe('getRandomIntegerNumber', () => {
    it('should return a number within the specified range', () => {
      const fromInclusive = 1;
      const toExclusive = 10;
      const result = randomNumber.getRandomIntegerNumber(fromInclusive, toExclusive);
      expect(result).toBeGreaterThanOrEqual(fromInclusive);
      expect(result).toBeLessThan(toExclusive);
    });

    it('should return an integer', () => {
      const result = randomNumber.getRandomIntegerNumber(1, 10);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle negative ranges correctly', () => {
      const result = randomNumber.getRandomIntegerNumber(-10, -5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThan(-5);
    });

    it('should return the same number when fromInclusive is equal to toExclusive', () => {
      const result = randomNumber.getRandomIntegerNumber(5, 6);
      expect(result).toBe(5);
    });
  });
});
