import { NumberUtility } from '../../src/shared/utils/number-utility.js';

export class MockNumberUtility extends NumberUtility {
  #pointerIndex = 0;
  #mockValues;

  constructor(mockValues) {
    super();
    this.#mockValues = mockValues;
  }

  getRandomPosition(unitCoordinates, skySettings) {
    return this.#mockValues[this.#pointerIndex++];
  }
}