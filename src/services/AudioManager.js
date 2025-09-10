export class AudioManager {
  static sounds = {
    click: new Audio('/assets/sounds/click.mp3'),
    catcherMove: new Audio('/assets/sounds/catcherMove.mp3'),
    catchGlitch: new Audio('/assets/sounds/catch.mp3'),
    catcherClash: new Audio('/assets/sounds/clash.mp3'),
    skyBoundaryHit: new Audio('/assets/sounds/boundary.mp3'),
    win: new Audio('/assets/sounds/win.mp3'),
    lose: new Audio('/assets/sounds/lose.mp3'),
    notification: new Audio('/assets/sounds/notification.mp3')
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