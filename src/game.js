import { GAME_STATUSES , MOVE_DIRECTIONS } from './shared/constants.js';
import { Settings } from './shared/settings.js';
import { Catcher } from './catcher.js';
import { Glitch } from './glitch.js';
import { GlitchSpeedJump } from './glitch-speed-jump.js';

export class Game {
  constructor(numberUtility , gameSettings) {
    this.#numberUtility = numberUtility;
    this.#settings = new Settings(gameSettings);
  }

  #status = GAME_STATUSES.PENDING;

  get status() {
    return this.#status;
  }

  #glitch;

  get glitch() {
    return this.#glitch;
  }

  get glitchPosition() {
    return this.#glitch.position;
  }

  set glitchPosition(newPosition) {
    this.#glitch.position = newPosition;
  }

  #glitchSetIntervalId;

  #catchers = new Map();

  #catcherOne;

  get catcherOne() {
    return this.#catcherOne;
  }

  get catcherOnePosition() {
    return this.#catcherOne.position;
  }

  set catcherOnePosition(newPosition) {
    this.#catcherOne.position = newPosition;
  }

  #catcherTwo;

  get catcherTwo() {
    return this.#catcherTwo;
  }

  get catcherTwoPosition() {
    return this.#catcherTwo.position;
  }

  #settings;

  get settings() {
    return {
      ...this.#settings ,
      skySize: {
        ...this.#settings.skySize
      } ,
      glitchSpeedJump: {
        ...this.#settings.glitchSpeedJump
      } ,
      gameTime: this.#settings.gameTime ,
      soundEnabled: this.#settings.soundEnabled
    };
  }

  set settings(settings) {
    if (settings.skySize &&
      settings.skySize.rowsCount * settings.skySize.columnsCount < 4) {
      throw new RangeError('The size of the sky should be bigger');
    }

    const skySize = settings.skySize
                    ? { ...settings.skySize }
                    : this.#settings.skySize;

    const glitchSpeedJump = settings.glitchSpeedJump
                            ? new GlitchSpeedJump(settings.glitchSpeedJump.level)
                            : this.#settings.glitchSpeedJump;

    const gameTime = settings.gameTime ? settings.gameTime : this.#settings.gameTime;

    this.#settings = {
      ...this.#settings ,
      skySize ,
      glitchSpeedJump ,
      gameTime
    };
  }

  #score = new Map();

  #startTime;

  #gameTimerId;

  #numberUtility;

  start() {
    if (this.#status === GAME_STATUSES.PENDING) {
      this.#createUnits();
      this.#status = GAME_STATUSES.IN_PROGRESS;
    }

    this.#runGlitchJumpInterval();
  }

  startGameTimer() {
    this.#gameTimerId = setInterval( () => {
      const time = this.getFormattedTime();
      console.log(time);

      if (this.isGameOverByTime()) {
        this.#lose();
        this.stop();
      }
    }, 1000);
  }

  getFormattedTime() {
    const remainingMs = this.#getRemainingTimeMs();
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  stop() {
    clearInterval(this.#glitchSetIntervalId);
    clearInterval(this.#gameTimerId);
    this.#status = GAME_STATUSES.COMPLETED;
  }

  moveCatcher(catcherId , direction) {
    const catcher = this.#catchers.get(catcherId);
    if (!catcher) throw new Error(`Catcher with id ${catcherId} not found`);

    const newPosition = catcher.position.clone();

    switch (direction) {
      case MOVE_DIRECTIONS.UP:
        newPosition.y--;
        break;
      case MOVE_DIRECTIONS.DOWN:
        newPosition.y++;
        break;
      case MOVE_DIRECTIONS.LEFT:
        newPosition.x--;
        break;
      case MOVE_DIRECTIONS.RIGHT:
        newPosition.x++;
        break;
      default:
        throw new Error('Invalid direction');
    }

    if (!this.#isInsideSky(newPosition)){
      this.#updateScore(catcherId, -5);
      return;
    }

    if (this.#isCellBusyByOtherCatcher(newPosition , catcherId)) {
      this.#updateScore(catcherId, -8);
      return;
    }

    catcher.position = newPosition;

    const wasGlitchCaught = this.#isGlitchBeingCaught(catcherId);

    if (wasGlitchCaught) {
      this.#updateScore(catcherId , 15);

      if (this.getCatcherScore(catcherId) >= 150) {
        this.win(catcherId);
      }
    }

    this.#updateGlitchStrike(catcherId , wasGlitchCaught);
  }

  getCatcherScore(catcherId) {
    return this.#score.get(catcherId).points ?? 0;
  }

  getGlitchStrike(catcherId) {
    return this.#score.get(catcherId)?.glitchStrike ?? 0;
  }

  toggleSound() {
    this.#settings.toggleSound();
  }

  win(catcherId) {
    return catcherId
  }

  isGameOverByTime() {
    return (Date.now() - this.#startTime) > this.#settings.gameTime;
  }

  #lose() {
    return 'Glitch wins'
  }


  #glitchJump() {
    this.#glitch.position = this.#numberUtility.getRandomPosition(
      [this.#catcherOne.position , this.#catcherTwo.position , this.#glitch.position] , this.settings.skySize);
  }

  #runGlitchJumpInterval() {
    this.#glitchSetIntervalId = setInterval(() => {
      this.#glitchJump();
    } , this.#settings.glitchSpeedJump.interval);
  }

  #createUnits() {
    const catcherOneStartPosition = this.#numberUtility.getRandomPosition([] , this.settings.skySize);
    const one = new Catcher(1 , catcherOneStartPosition);
    this.#catcherOne = one;

    const catcherTwoStartPosition = this.#numberUtility.getRandomPosition([catcherOneStartPosition] ,
                                                                          this.settings.skySize);
    const two = new Catcher(2 , catcherTwoStartPosition);
    this.#catcherTwo = two;

    this.#catchers.set(1 , one);
    this.#catchers.set(2 , two);

    const glitchStartPosition = this.#numberUtility.getRandomPosition(
      [catcherOneStartPosition , catcherTwoStartPosition] , this.settings.skySize);

    this.#glitch = new Glitch(glitchStartPosition);
  }

  #isInsideSky(newPosition) {
    return 0 <= newPosition.x && newPosition.x < this.settings.skySize.columnsCount
      && 0 <= newPosition.y && newPosition.y < this.settings.skySize.rowsCount;
  }

  #isCellBusyByOtherCatcher(newPosition , catcherId) {
    for (const [id , catcher] of this.#catchers.entries()) {
      if (catcherId !== id && catcher.position.equals(newPosition)) {
        return true;
      }
    }
    return false;
  }

  #isGlitchBeingCaught(catcherId) {
    const catcher = this.#catchers.get(catcherId);

    return this.#glitch.position.equals(catcher.position);
  }

  #updateScore(catcherId , delta) {
    const currentScore = this.#score.get(catcherId) ?? { points: 0 , glitchStrike: 0 };
    const updatedScore = {
      ...currentScore ,
      points: currentScore.points + delta
    };
    this.#score.set(catcherId , updatedScore);
  }

  #updateGlitchStrike(catcherId , wasGlitchCaught) {
    const currentScore = this.#score.get(catcherId) ?? { points: 0 , glitchStrike: 0 };

    const updatedScore = {
      points: currentScore.points ,
      glitchStrike: wasGlitchCaught
                    ? currentScore.glitchStrike + 1
                    : currentScore.glitchStrike - 1
    };

   this.#applyGlitchStrikeEffects(updatedScore)

    this.#score.set(catcherId , updatedScore);
  }

  #applyGlitchStrikeEffects(score) {
    if (score.glitchStrike === 3) {
      score.points += 20;
      score.glitchStrike = 1;
    }

    if (score.glitchStrike === -5) {
      score.points -= 3;
      score.glitchStrike = 0;
    }
  }

  #getRemainingTimeMs() {
    const elapsed = Date.now() - this.#startTime;
    const total = this.#settings.gameTime;
    return Math.max(total - elapsed, 0);
  }

  /**
   * @internal Used only for testing purposes
   */

  __forceScore(catcherId, score, strike = 0) {
    this.#score.set(catcherId, { points: score, glitchStrike: strike });
  }

  __forceStartTime(ms) {
    this.#startTime = ms;
  }
}
