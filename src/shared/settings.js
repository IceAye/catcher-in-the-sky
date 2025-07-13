import { SkySize } from '../skySize.js';

export class Settings {
  constructor(skySize = {}) {
    this.skySize = new SkySize(skySize);
    this.glitchJumpInterval = 1000;
  }
}
