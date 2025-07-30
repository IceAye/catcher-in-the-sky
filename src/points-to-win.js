export class PointsToWin {
  constructor({ mode = 'duel' , customPoints = null } = {}) {
    this.mode = mode;

    this.presets = {
      blitz: 50 ,
      duel: 150 ,
      marathon: 300 ,
      custom: customPoints
    };
  }

  getPoints() {
    if (this.mode === 'custom' && this.presets.custom == null) {
      throw new Error('Custom points value is not set');
    }
    return this.presets[this.mode];
  }

  clone() {
    return new PointsToWin({
                             mode: this.mode ,
                             customPoints: this.presets.custom
                           });
  }
}