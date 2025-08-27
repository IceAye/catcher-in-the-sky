export class AudioManager {
  static sounds = {
    click: new Audio('front/assets/sounds/click.mp3'),
    // glitchMove: new Audio('assets/sounds/glitchMove.mp3'),
    // playerMove: new Audio('assets/sounds/playerMove.mp3'),
    // catchGlitch: new Audio('assets/sounds/catch.mp3'),
    // collision: new Audio('assets/sounds/collision.mp3'),
    // win: new Audio('assets/sounds/win.mp3'),
    // lose: new Audio('assets/sounds/lose.mp3'),
  };

  static play(name, soundEnabled) {
    if (!soundEnabled) return;
    const sound = AudioManager.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }
}