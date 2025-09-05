import { GAME_STATUSES } from '../shared/constants/gameSetup.js';
import { msToMinutes , msToSeconds } from '../shared/utils/time.js';
import { settingsConfig } from '../shared/settingsModule/settingsConfig.js';
import { SettingsDraftBuilder } from '../shared/settingsModule/settingsDraftBuilder.js';
import { AudioManager } from '../services/AudioManager.js';
import { EVENTS } from '../shared/constants/serverEvents.js';

export class Controller {

  constructor(model , view) {
    this.#model = model;
    this.#view = view;
  }

  #model;
  #view;

  init() {
    this.#renderCurrentState();
    this.#initModelEventHandlers();
    this.#view.onstart = (settingsToModel) => {
      this.#applySettings(settingsToModel);
      this.#start();
      this.#startGameTimer();
    };
    this.#view.onCatcherOneMove = this.#handleCatcherMove(1);
    this.#view.onCatcherTwoMove = this.#handleCatcherMove(2);
    this.#model.subscribe(() => {
      this.#renderCurrentState();
      this.#handleModelUpdate();
      this.#handleGameEvents();
    });
    this.#view.onRestart = () => {
      this.#model.restart();
      this.#view.hideModal();
    };
    this.#view.onToggleSound = () => {
      this.#model.toggleSoundSetting();
      this.#view.updateSoundButton(this.#model.settings.soundEnabled);
    };
  }

  #initModelEventHandlers() {
    if (typeof this.#model.on === 'function') {
      this.#model.on(EVENTS.ROLE_ASSIGNED, (data) => {
        this.#view.showNotification(`You are ${data.role}`);
        AudioManager.play('notification', true);
      });

      this.#model.on(EVENTS.SECOND_CATCHER_CONNECTED, () => {
        this.#view.showNotification('Second player connected!');
        AudioManager.play('notification', true);
      });
    }
  }

  #handleCatcherMove(id) {
    return ({ direction }) => {
      AudioManager.play('catcherMove' , this.#model.settings.soundEnabled);
      this.#model.moveCatcher(id , direction);
    };
  }

  #handleModelUpdate() {
    const result = this.#model.getGameResult?.();
    const soundEnabled = this.#model.settings.soundEnabled;

    if (result) {
      this.#view.showModal(result.outcome , result.winnerId , result.stats);

      switch (result.outcome) {
        case 'win':
          AudioManager.play('win' , soundEnabled);
          break;
        case 'lose':
          AudioManager.play('lose' , soundEnabled);
          break;
      }
     }
  }

  #handleGameEvents() {
    const wasGlitchCaught = this.#model.wasGlitchCaught;

    const soundEnabled = this.#model.settings.soundEnabled;

    if (this.#model.wasCatcherCollision) {
      AudioManager.play('catcherClash', soundEnabled);
    }

    if (this.#model.wasSkyExit) {
      AudioManager.play('skyBoundaryHit', soundEnabled);
    }

    if (wasGlitchCaught) {
      AudioManager.play('catchGlitch', soundEnabled);
    }
  }

  #applySettings(settingsToModel) {
    const settingsToApply = {
      ...SettingsDraftBuilder.finalizeSettings(settingsToModel) ,
      soundEnabled: this.#model.settings.soundEnabled
    };

    this.#model.applySettings(settingsToApply);
  }

  #start() {
    this.#model.start();
    this.#renderCurrentState();
  }

  #startGameTimer() {
    this.#model.startGameTimer();
    this.#renderCurrentState();
  }

  #renderCurrentState() {
    let isSettingsActive = true;
    if (this.#model.status !== GAME_STATUSES.PENDING) {
      isSettingsActive = false;
    }
    this.#view.render(this.#mapModelToDTO() ,
                      this.#mapSettingsToDTO(isSettingsActive));
  }

  #mapModelToDTO() {
    return {
      status: this.#model.status ,
      glitchPosition: { ...this.#model.glitchPosition } ,
      catcherOnePosition: { ...this.#model.catcherOnePosition } ,
      catcherTwoPosition: { ...this.#model.catcherTwoPosition } ,
      remainingTime: this.#deriveTimeParts() ,
      score: this.#deriveCatchersScore()
    };
  }

  #mapSettingsToDTO(isSettingsActive) {
    const dto = {
      ...SettingsDraftBuilder.generateSettingsDTO(settingsConfig , this.#model.settings , isSettingsActive) ,
      soundEnabled: this.#model.settings.soundEnabled
    };
    return dto;
  }

  #deriveTimeParts() {
    const ms = this.#model.remainingTimeMs;
    return {
      minutes: msToMinutes(ms) ,
      seconds: msToSeconds(ms)
    };
  }

  #deriveCatchersScore() {
    const scoreMap = this.#model.getScore();
    const result = {};

    for (const [id , { points , currentStrike }] of scoreMap.entries()) {
      result[id] = { points , currentStrike };
    }

    return result;
  }
}