import { SkySize } from '../../config/sky-size.js';
import { GlitchSpeedJump } from '../../config/glitch-speed-jump.js';
import { PointsToWin } from '../../config/points-to-win.js';
import { DEFAULT_GAME_TIME_2MIN } from '../constants.js';
import { minutesToMs } from '../utils/time.js';

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

  apply(settings) {
    if ('skySize' in settings && settings.skySize !== undefined) {
      this.skySize = new SkySize(settings.skySize);
    }

    if ('glitchSpeedJump' in settings && settings.glitchSpeedJump !== undefined) {
      this.glitchSpeedJump = new GlitchSpeedJump(settings.glitchSpeedJump.level);
    }

    if ('gameTime' in settings && settings.gameTime !== undefined) {
      this.gameTime = minutesToMs(settings.gameTime);
    }

    if ('soundEnabled' in settings && settings.soundEnabled !== undefined) {
      this.soundEnabled = settings.soundEnabled;
    }

    if ('pointsToWin' in settings && settings.pointsToWin !== undefined) {
      const mode = settings.pointsToWin.mode ?? 'duel';
      const customPoints = settings.pointsToWin.customPoints ?? null;
      this.pointsToWin = new PointsToWin({ mode, customPoints });
    }
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
