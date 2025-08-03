export class SkySize {
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
