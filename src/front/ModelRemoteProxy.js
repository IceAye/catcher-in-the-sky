import { GAME_STATUSES } from '../shared/constants/gameSetup.js';
import { Position } from '../config/position.js';
import { Settings } from '../shared/settingsModule/settings.js';
import { buildDefaultSettings } from '../shared/utils/build-default-settings.js';
import { settingsConfig } from '../shared/settingsModule/settingsConfig.js';
import { ACTIONS , EVENTS } from '../shared/constants/serverEvents.js';

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
    remainingGameTimeMs: null ,
    settings: buildDefaultSettings(settingsConfig)
  };
  #settings = new Settings(this.#state.settings);
  #subscribers = [];
  #secondPlayerReady = false;
  #role = null;
  #eventHandlers = {};

  on(event, callback) {
    if(!this.#eventHandlers[event]) {
      this.#eventHandlers[event] = [];
    }
    this.#eventHandlers[event].push(callback);
  }

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    this.#channel = new WebSocket(`${protocol}://${host}`);

    this.#channel.addEventListener('message' , (event) => {
      const stateFromServer = JSON.parse(event.data);

      if (stateFromServer.type) {
        this.#handleServerEvent(stateFromServer);
      } else {
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
          remainingGameTimeMs: stateFromServer.remainingGameTimeMs
        };

        if ('settings' in stateFromServer) {
          this.#state = {
            ...this.#state , settings: {
              ...this.#state.settings ,
              ...stateFromServer.settings
            }
          };
          Object.assign(this.#settings , stateFromServer.settings);
        }
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
    if (
      (this.#role === 'catcherOne' && catcherId === 1) ||
      (this.#role === 'catcherTwo' && catcherId === 2)
    ) {
      this.#channel.send(JSON.stringify({
                                          type: ACTIONS.MOVE_CATCHER ,
                                          payload: { catcherId , direction }
                                        }));
    }
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

  #emit(event, data) {
    this.#eventHandlers[event]?.forEach(cb => cb(data));
  }

  #handleServerEvent(event) {
    switch (event.type) {
      case EVENTS.SECOND_CATCHER_CONNECTED:
        this.#secondPlayerReady = true;
        this.#emit(EVENTS.SECOND_CATCHER_CONNECTED);
        break;

      case EVENTS.ROLE_ASSIGNED:
        this.#role = event.role;
        this.#emit(EVENTS.ROLE_ASSIGNED, { role: this.#role });
        break;

      default:
        console.warn('Unknown server event type:' , event.type);
    }
  }


  start() {
    this.#channel.send(JSON.stringify({ type: ACTIONS.START }));
  }

  startGameTimer() {
    this.#channel.send(JSON.stringify({ type: ACTIONS.START_GAME_TIMER}));
  }

  restart() {
    this.#channel.send(JSON.stringify({ type: ACTIONS.RESTART }));
  }

  toggleSoundSetting() {
    this.#settings.toggleSound();
    this.#state = {
      ...this.#state ,
      settings: {
        ...this.#state.settings ,
        soundEnabled: this.#settings.soundEnabled
      }
    };
    this.#channel.send(JSON.stringify({ type: ACTIONS.TOGGLE_SOUND }));
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

    Object.assign(this.#settings , newSettings);

    this.#state = {
      ...this.#state ,
      settings: {
        ...this.#state.settings ,
        ...newSettings
      }
    };

    this.#channel.send(JSON.stringify({ type: ACTIONS.APPLY_SETTINGS , payload: newSettings }));

    this.#notify();
  }

  getScore() {
    return new Map(this.#state.score);
  }
}