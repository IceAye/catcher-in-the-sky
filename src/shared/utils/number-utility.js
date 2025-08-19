import { Position } from '../../config/position.js';

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

  getRandomPosition(unitCoordinates, skySettings) {
    let newX;
    let newY;

    do {
      newX = this.getRandomIntegerNumber(0 , skySettings.columnsCount);
      newY = this.getRandomIntegerNumber(0 , skySettings.rowsCount);
    } while (unitCoordinates.some((el) => el.equals({ x: newX , y: newY })));

    return new Position(newX, newY);
  }
}