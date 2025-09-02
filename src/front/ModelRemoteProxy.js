import { GAME_STATUSES } from '../shared/constants.js';
import { Position } from '../config/position.js';
import { Settings } from '../shared/settingsModule/settings.js';

export class ModelRemoteProxy {
  #channel;
  #state = {
    status: GAME_STATUSES.PENDING ,
    glitchPosition: null ,
    catcherOnePosition: null ,
    catcherTwoPosition: null ,
    wasGlitchCaught: null ,
    wasCatcherCollision: null ,
    wasSkyExit: null ,
    gameResult: null ,
    score: [] ,
    remainingGameTimeMs: null,
    settings: null
  };
  #settings = null;
  #subscribers = [];

  constructor() {
    this.#channel = new WebSocket('ws://localhost:8080');

    this.#channel.addEventListener('message' , (event) => {
      const stateFromServer = JSON.parse(event.data);

      this.#state = {
        ...this.#state ,
        status: stateFromServer.status ,
        glitchPosition: stateFromServer.glitchPosition ? new Position(stateFromServer.glitchPosition.x ,
                                                                      stateFromServer.glitchPosition.y) : null ,
        catcherOnePosition: stateFromServer.catcherOnePosition
                            ? new Position(stateFromServer.catcherOnePosition.x ,
                                           stateFromServer.catcherOnePosition.y)
                            : null ,
        catcherTwoPosition: stateFromServer.catcherTwoPosition
                            ? new Position(stateFromServer.catcherTwoPosition.x ,
                                           stateFromServer.catcherTwoPosition.y)
                            : null ,
        wasGlitchCaught: stateFromServer.wasGlitchCaught ,
        wasCatcherCollision: stateFromServer.wasCatcherCollision ,
        wasSkyExit: stateFromServer.wasSkyExit ,
        gameResult: stateFromServer.gameResult ? { ...stateFromServer.gameResult } : null ,
        score: stateFromServer.score ,
        remainingGameTimeMs: stateFromServer.remainingGameTimeMs ,
      };

      if ('settings' in stateFromServer) {
        this.#state = { ...this.#state, settings: stateFromServer.settings };
        this.#settings = this.#hydrateSettings(stateFromServer.settings);
      }

      this.#subscribers.forEach(subscriber => subscriber());
    });
  }

  get wasGlitchCaught() {
    return this.#state.wasGlitchCaught;
  }

  get settings() {
    return this.#settings;
  }

  get wasCatcherCollision() {
    return this.#state.wasCatcherCollision;
  }

  get wasSkyExit() {
    return this.#state.wasSkyExit;
  }

  get status() {
    return this.#state.status;
  }

  get glitchPosition() {
    return this.#state.glitchPosition;
  }

  get catcherOnePosition() {
    return this.#state.catcherOnePosition;
  }

  get catcherTwoPosition() {
    return this.#state.catcherTwoPosition;
  }

  get remainingTimeMs() {
    return this.#state.remainingGameTimeMs;
  }

  #hydrateSettings(fromJSON) {
    return fromJSON ? new Settings(fromJSON) : null;
  }

  // reconstruct original model's methods
  moveCatcher(catcherId , direction) {
    this.#channel.send(JSON.stringify({ type: 'MOVE_CATCHER' , payload: { catcherId , direction } }));
  }

  subscribe(callback) {
    this.#subscribers.push(callback);
    return () => {
      this.#subscribers = this.#subscribers.filter(subscriber => subscriber !== callback);
    };
  }

  start() {
    // alert('Wait for the 2nd catcher')
    console.log('Game started');
    this.#channel.send(JSON.stringify({ type: 'START' }));
  }

  startGameTimer() {
    console.log('Game timer started');
    this.#channel.send(JSON.stringify({ type: 'START_GAME_TIMER' }));
  }

  restart() {
    console.log('Game restarted');
    this.#channel.send(JSON.stringify({ type: 'RESTART' }));
  }

  toggleSoundSetting() {
    console.log('Sound setting toggled');
  }

  getGameResult() {
    return this.#state.gameResult;
  }

  applySettings(settings) {
  }

  getScore() {
    return new Map(this.#state.score);
  }
}