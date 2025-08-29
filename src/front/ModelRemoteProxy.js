import { minutesToMs } from '../shared/utils/time.js';

export class ModelRemoteProxy {
  #channel;
  #state;

  constructor() {
    this.#channel = new WebSocket('ws://localhost:8080');

    this.#channel.addEventListener('message' , (event) => {
      this.#state = JSON.parse(event.data);
    });
  }

  get wasGlitchCaught() {
    return false;
  }

  get settings() {
    return {
      skySize: { columnsCount: 4 , rowsCount: 4 } ,
      pointsToWin: { mode: 'duel' , customPoints: null , total: 150} ,
      glitchSpeedJump: {level: 'junior'},
      soundEnabled: true
    };
  }

  get wasCatcherCollision() {
    return false;
  }

  get wasSkyExit() {
    return false;
  }

  get status() {
    return this.#state?.status ?? 'pending';
  }

  get glitchPosition() {
    return { x: 1 , y: 1 };
  }

  get catcherOnePosition() {
    return { x: 2 , y: 2 };
  }

  get catcherTwoPosition() {
    return { x: 0 , y: 1 };
  }

  get remainingTimeMs() {
    return minutesToMs(2);
  }

  // reconstruct original model's methods
  moveCatcher(catcherId , direction) {
    console.log(`moveCatcher(${catcherId}, ${direction})`);
  }

  subscribe(callback) {
  }

  start() {
    console.log('Game started');
    this.#channel.send(JSON.stringify({ type: 'START' }));
  }

  startGameTimer() {
    console.log('Game timer started');
  }

  restart() {
    console.log('Game restarted');
  }

  toggleSoundSetting() {
    console.log('Sound setting toggled');
  }

  getGameResult() {
    return null;
  }

  applySettings(settings) {
  }

  getScore() {
    return new Map([
                     [1, { points: 0 , currentStrike: 0 }],
                     [2, { points: 5 , currentStrike: 1 }]
                   ]);
  }
}