export class AudioManager {
  static sounds = {
    click: new Audio('front/assets/sounds/click.mp3'),
    catcherMove: new Audio('front/assets/sounds/catcherMove.mp3'),
    catchGlitch: new Audio('front/assets/sounds/catch.mp3'),
    catcherClash: new Audio('front/assets/sounds/clash.mp3'),
    skyBoundaryHit: new Audio('front/assets/sounds/boundary.mp3'),
    win: new Audio('front/assets/sounds/win.mp3'),
    lose: new Audio('front/assets/sounds/lose.mp3'),
    notification: new Audio('front/assets/sounds/notification.mp3')
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