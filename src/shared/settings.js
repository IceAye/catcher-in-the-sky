import { SkySize } from '../config/sky-size.js';
import { GlitchSpeedJump } from '../config/glitch-speed-jump.js';
import { PointsToWin } from '../config/points-to-win.js';

export class Settings {
  constructor({ skySize = {} , level , gameTime = 1000 * 60 * 2 , points = {} } = {}) {
    this.skySize = new SkySize(skySize);
    this.glitchSpeedJump = new GlitchSpeedJump(level);
    this.gameTime = gameTime;
    this.pointsToWin = new PointsToWin(points);
  }

  soundEnabled = true;

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
  }

  getPointsToWin() {
    return this.pointsToWin.getPoints();
  }

  clone() {
    return new Settings({
                          skySize: this.skySize.clone?.() ?? {} ,
                          level: this.glitchSpeedJump.getLevel?.() ,
                          gameTime: this.gameTime ,
                          points: this.pointsToWin.clone?.() ?? {}
                        });
  }
}
