import { GAME_STATUSES , MOVE_DIRECTIONS } from '../../shared/constants.js';
import { Settings } from '../../shared/settings.js';
import { Catcher } from './catcher.js';
import { Glitch } from './glitch.js';
import { GlitchSpeedJump } from '../../config/glitch-speed-jump.js';
import { PointsToWin } from '../../config/points-to-win.js';

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
    return this.#glitch
           ? this.#glitch.position
           : { x: null, y: null };
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
    return this.#catcherOne ? this.#catcherOne.position : {x: null, y: null};
  }

  set catcherOnePosition(newPosition) {
    this.#catcherOne.position = newPosition;
  }

  #catcherTwo;

  get catcherTwo() {
    return this.#catcherTwo;
  }

  get catcherTwoPosition() {
    return this.#catcherTwo ? this.#catcherTwo.position : {x: null, y: null};
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
      soundEnabled: this.#settings.soundEnabled ,
      pointsToWin: {
        mode: this.#settings.pointsToWin.mode,
        total: this.#settings.pointsToWin.getPoints()
      }
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

    const { points } = settings;
    const mode = points?.mode ?? 'duel';
    const customPoints = points?.customPoints ?? null;


    const pointsToWin = new PointsToWin({ mode, customPoints }) ?? this.#settings.pointsToWin

    this.#settings = {
      ...this.#settings ,
      skySize ,
      glitchSpeedJump ,
      gameTime ,
      pointsToWin,
    };

    this.#notify();
  }

  #score = new Map();

  #startTime = null;

  #gameTimerId;

  #numberUtility;

  #subscribers = [];

  start() {
    if (this.#status === GAME_STATUSES.PENDING) {
      this.#createUnits();
      this.#status = GAME_STATUSES.IN_PROGRESS;
    }

    this.#runGlitchJumpInterval();
    this.#notify();

  }

  get remainingTimeMs() {
    return this.#startTime ? this.#calculateRemainingTimeMs() : null;
  }

  stop() {
    this.#cleanup();
    this.#status = GAME_STATUSES.COMPLETED;
  }

  restart() {
    this.#cleanup();
    this.#status = GAME_STATUSES.PENDING;
  }

  #cleanup() {
    this.#startTime = null;
    clearInterval(this.#glitchSetIntervalId);
    clearInterval(this.#gameTimerId);
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

    if (!this.#isInsideSky(newPosition)) {
      this.#updateScore(catcherId , -5);
      return;
    }

    if (this.#isCellBusyByOtherCatcher(newPosition , catcherId)) {
      this.#updateScore(catcherId , -8);
      return;
    }

    catcher.position = newPosition;

    this.#notify();


    const wasGlitchCaught = this.#isGlitchBeingCaught(catcherId);

    if (wasGlitchCaught) {
      this.#updateScore(catcherId , 15);
      if (this.getCatcherScore(catcherId) >= this.#settings.pointsToWin.getPoints()) {
        this.#win(catcherId);
        this.stop();
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

  isGameOverByTime() {
    if (typeof this.#startTime !== 'number') return false;
    return (Date.now() - this.#startTime) > this.#settings.gameTime;
  }

  toggleSound() {
    this.#settings.toggleSound();
  }

  subscribe(newSubscriber) {
    this.#subscribers.push(newSubscriber);

  }

  unsubscribe(subscriber) {
      this.#subscribers.filter(s => s !== subscriber);
  }

  #notify() {
    this.#subscribers.forEach(s => s());
  }

  #win(catcherId) {
    return catcherId;
  }

  #lose() {
    return 'Glitch wins';
  }


  #glitchJump() {
    this.#glitch.position = this.#numberUtility.getRandomPosition(
      [this.#catcherOne.position , this.#catcherTwo.position , this.#glitch.position] , this.settings.skySize);
  }

  #runGlitchJumpInterval() {
    this.#glitchSetIntervalId = setInterval(() => {
      this.#glitchJump();
      this.#notify();
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

    this.#applyGlitchStrikeEffects(updatedScore);

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

  startGameTimer() {
    this.#startTime = Date.now();

    this.#gameTimerId = setInterval(() => {
      this.#calculateRemainingTimeMs();
      this.#notify();

      if (this.isGameOverByTime()) {
        this.#lose();
        this.stop();
        this.#notify();
      }
    } , 1000);
  }

  #calculateRemainingTimeMs() {
    const elapsed = Date.now() - this.#startTime;
    const total = this.#settings.gameTime;
    return Math.max(total - elapsed , 0);
  }

  /**
   * @internal Used only for testing purposes
   */

  __forceScore(catcherId , score , strike = 0) {
    this.#score.set(catcherId , { points: score , glitchStrike: strike });
  }

  __forceStartTime(ms) {
    this.#startTime = ms;
  }
}
