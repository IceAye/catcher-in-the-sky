import { GAME_STATUSES } from '../shared/constants.js';
import { Position } from '../config/position.js';
import { Settings } from '../shared/settingsModule/settings.js';
import { buildDefaultSettings } from '../shared/utils/build-default-settings.js';
import { settingsConfig } from '../shared/settingsModule/settingsConfig.js';

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
    settings: buildDefaultSettings(settingsConfig)
  };
  #settings = new Settings(this.#state.settings);
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
        this.#state = { ...this.#state, settings: {
          ...this.#state.settings,
          ...stateFromServer.settings
        } };
        Object.assign(this.#settings, stateFromServer.settings)
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

  #notify() {
    for (const callback of this.#subscribers) {
      callback(this.#state);
    }
  }

  start() {
    // alert('Wait for the 2nd catcher')
    this.#channel.send(JSON.stringify({ type: 'START' }));
  }

  startGameTimer() {
    this.#channel.send(JSON.stringify({ type: 'START_GAME_TIMER' }));
  }

  restart() {
    this.#channel.send(JSON.stringify({ type: 'RESTART' }));
  }

  toggleSoundSetting() {
    this.#settings.toggleSound();
    this.#state = {
      ...this.#state,
      settings: {
        ...this.#state.settings,
        soundEnabled: this.#settings.soundEnabled,
      }
    }
    this.#channel.send(JSON.stringify({type: 'TOGGLE_SOUND'}));
    this.#notify();
  }

  getGameResult() {
    return this.#state.gameResult;
  }

  applySettings(newSettings) {
    if (!newSettings || typeof newSettings !== 'object') {
      console.warn('Invalid settings object');
      return;
    }

    Object.assign(this.#settings, newSettings);

    this.#state = {
      ...this.#state,
      settings: {
        ...this.#state.settings,
        ...newSettings
      }
    }

    this.#channel.send(JSON.stringify({type: 'APPLY_SETTINGS', payload: newSettings}));

    this.#notify();
  }

  getScore() {
    return new Map(this.#state.score);
  }
}