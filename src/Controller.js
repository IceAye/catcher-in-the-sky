import { SkySize } from './config/sky-size.js';
import { GlitchSpeedJump } from './config/glitch-speed-jump.js';
import { GAME_STATUSES } from './shared/constants.js';
import { msToMinutes , msToSeconds } from './shared/utils/time.js';

export class Controller {

  constructor(model , view) {
    this.#model = model;
    this.#view = view;
  }

  #model;
  #view;

  init() {
    this.#renderCurrentState();
    this.#view.onstart = (settingsToModel) => {
      this.#applySettings(settingsToModel);
      this.#start();
      this.#startGameTimer();
    };
    this.#view.onCatcherOneMove = this.#handleCatcherMove(1);
    this.#view.onCatcherTwoMove = this.#handleCatcherMove(2);
    this.#model.subscribe(() => {
      this.#renderCurrentState();
      this.#handleModelUpdate()
    });
    this.#view.onRestart = () => {
      this.#model.restart();
      this.#view.hideModal();
    }
    this.#view.onToggleSound = () => {
      this.#model.toggleSoundSetting();
      this.#view.updateSoundButton(this.#model.settings.soundEnabled);
    }
  }

  #handleCatcherMove(id) {
    return ({ direction }) => {
     this.#model.moveCatcher(id , direction);
    };
  }

  #handleModelUpdate() {
    const result = this.#model.getGameResult?.();

    if (result) {
      this.#view.showModal(result.outcome, result.winnerId, result.stats);
    }
  }

  #applySettings(settingsToModel) {
    const settingsToApply = {
      ...settingsToModel ,
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
    return {
      ...this.#model.settings,
      skySize: {
        ...this.#model.settings.skySize ,
        presets: SkySize.presets
      } ,
      gameTime: msToMinutes(this.#model.settings.gameTime) ,
      pointsToWin: {
        mode: this.#model.settings.pointsToWin.mode ,
        total: this.#model.settings.pointsToWin.total ,
        presets: this.#model.settings.pointsToWin.presets
      } ,
      glitchSpeedJump: {
        levels: GlitchSpeedJump.levels
      } ,
      soundEnabled: this.#model.settings.soundEnabled ,
      isSettingsActive
    };
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
      result[id] = { points , currentStrike};
    }

    return result;
  }
}