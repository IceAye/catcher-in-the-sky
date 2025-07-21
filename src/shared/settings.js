import { SkySize } from '../skySize.js';
import { GlitchSpeedJump } from '../glitch-speed-jump.js';

export class Settings {
  constructor({ skySize = {} , level } = {}) {
    this.skySize = new SkySize(skySize);
    this.glitchSpeedJump = new GlitchSpeedJump(level);
  }
}
