export class GlitchSpeedJump {
  static levels = {
    rookie: 1600,
    junior: 1200,
    amateur: 800,
    pro: 400
  }

  constructor(level = 'junior') {
    if (!GlitchSpeedJump.levels[level]) {
      throw new RangeError(`Unknown speed level: ${level}`);
    }
    this.level = level;
    this.interval = GlitchSpeedJump.levels[level];
  }

  getLevel() {
    return this.level
  }
}