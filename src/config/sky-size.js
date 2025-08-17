export class SkySize {
  static presets = {
    '4x4': 4,
    '5x5': 5,
    '6x6': 6,
    '7x7': 7,
    '8x8': 8,
  };

  constructor({ columnsCount = 4 , rowsCount = 4 } = {}) {
    this.columnsCount = columnsCount;
    this.rowsCount = rowsCount;
  }

  clone() {
    return new SkySize({
                         columnsCount: this.columnsCount ,
                         rowsCount: this.rowsCount
                       });
  }
}
