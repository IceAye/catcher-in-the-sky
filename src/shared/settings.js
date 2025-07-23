import { SkySize } from '../skySize.js';
import { GlitchSpeedJump } from '../glitch-speed-jump.js';

export class Settings {
  constructor({ skySize = {} , level, gameTime = 1000 * 60 * 2 } = {}) {
    this.skySize = new SkySize(skySize);
    this.glitchSpeedJump = new GlitchSpeedJump(level);
    this.gameTime = gameTime;
  }
  soundEnabled = true;

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
  }
}
