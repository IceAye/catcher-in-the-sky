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
    this.#view.onCatcherOneMove = ({ direction }) => {
      this.#model.moveCatcher(1 , direction);
    };
    this.#view.onCatcherTwoMove = ({ direction }) => {
      this.#model.moveCatcher(2 , direction);
    };
    this.#model.subscribe(() => {
      this.#renderCurrentState();
    });
  }

  #applySettings(settingsToModel) {
    this.#model.settings = settingsToModel;
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
    this.#view.render(this.#mapModelToDTO() , this.#mapSettingsToDTO());
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

  #mapSettingsToDTO() {
    return {
      skySize: { ...this.#model.settings.skySize } ,
      gameTime: this.#model.settings.gameTime ,
      pointsToWin: {
        mode: this.#model.settings.pointsToWin.mode ,
        total: this.#model.settings.pointsToWin.total ,
        presets: this.#model.settings.pointsToWin.presets
      } ,
      glitchSpeedJump: { ...this.#model.settings.glitchSpeedJump } ,
      soundEnabled: this.#model.settings.soundEnabled
      //todo: flag disabled for settings
    };
  }

  #deriveTimeParts() {
    const ms = this.#model.remainingTimeMs;
    return {
      minutes: Math.floor(ms / 60000) ,
      seconds: Math.floor((ms % 60000) / 1000)
    };
  }

  #deriveCatchersScore() {
    const scoreMap = this.#model.getScore();
    const result = {};

    for (const [id , { points , glitchStrike }] of scoreMap.entries()) {
      result[id] = { points , glitchStrike };
    }

    return result;
  }
}