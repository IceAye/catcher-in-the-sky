import { SkySize } from '../config/sky-size.js';
import { GlitchSpeedJump } from '../config/glitch-speed-jump.js';
import { PointsToWin } from '../config/points-to-win.js';
import { DEFAULT_GAME_TIME_2MIN } from './constants.js';

export class Settings {
  constructor({ skySize = {} , level , gameTime = DEFAULT_GAME_TIME_2MIN , points = {} } = {}) {
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

  get pointsPresets() {
    return this.pointsToWin.presets;
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
