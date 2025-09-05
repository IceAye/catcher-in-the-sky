import { GAME_STATUSES , MOVE_DIRECTIONS , SCORE_RULES } from '../../shared/constants/gameSetup.js';
import { Settings } from '../../shared/settingsModule/settings.js';
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

  #gameResult = null;

  set glitchPosition(newPosition) {
    this.#glitch.position = newPosition;
  }

  #glitchSetIntervalId;

  #catchers = new Map();

  #catcherOne;

  get catcherOne() {
    return this.#catcherOne;
  }
  #score = new Map();

  set catcherOnePosition(newPosition) {
    this.#catcherOne.position = newPosition;
  }

  #catcherTwo;

  get catcherTwo() {
    return this.#catcherTwo;
  }
  #wasGlitchCaught = false;

  #settings;
  #wasSkyExit = false;
  #wasCatcherCollision = false;

  get glitchPosition() {
    return this.#glitch
           ? this.#glitch.position
           : { x: null , y: null };
  }

  getGameResult() {
    return this.#gameResult;
  }

  get catcherOnePosition() {
    return this.#catcherOne ? this.#catcherOne.position : { x: null , y: null };
  }

  get catcherTwoPosition() {
    return this.#catcherTwo ? this.#catcherTwo.position : { x: null , y: null };
  }

  get settings() {
    return {
      skySize: {
        ...this.#settings.skySize
      } ,
      glitchSpeedJump: {
        ...this.#settings.glitchSpeedJump
      } ,
      gameTime: this.#settings.gameTime ,
      soundEnabled: this.#settings.soundEnabled ,
      pointsToWin: {
        mode: this.#settings.pointsToWin.mode ,
        total: this.#settings.pointsToWin.getPoints()
      }
    };
  }

  set settings(settings) {
    if (settings.skySize &&
      settings.skySize.rowsCount * settings.skySize.columnsCount < 4) {
      throw new RangeError('The size of the sky should be bigger');
    }

    if (settings.skySize) {
      this.#settings.skySize = { ...settings.skySize };
    }

    if (settings.glitchSpeedJump) {
      this.#settings.glitchSpeedJump = new GlitchSpeedJump(settings.glitchSpeedJump.level);
    }

    if (settings.gameTime) {
      this.#settings.gameTime = settings.gameTime;
    }

    if (settings.pointsToWin) {
      const mode = settings.pointsToWin.mode ?? 'duel';
      const customPoints = settings.pointsToWin.customPoints ?? null;
      this.#settings.pointsToWin = new PointsToWin({ mode , customPoints });
    }

    if ('soundEnabled' in settings) {
      this.#settings.soundEnabled = settings.soundEnabled;
    }

    this.#notify();
  }

  get wasGlitchCaught() {
    const caught = this.#wasGlitchCaught;
    this.#wasGlitchCaught = false;
    return caught;
  }

  get wasSkyExit() {
    const value = this.#wasSkyExit;
    this.#wasSkyExit = false;
    return value;
  }

  get wasCatcherCollision() {
    const value = this.#wasCatcherCollision;
    this.#wasCatcherCollision = false;
    return value;
  }

  getScore() {
    return new Map(this.#score);
  }

  #startTime = null;

  #gameTimerId;

  #numberUtility;

  #subscribers = [];

  start() {
    if (this.#status === GAME_STATUSES.PENDING) {
      this.#createUnits();
      this.#initializeScoreMap();
      this.#status = GAME_STATUSES.IN_PROGRESS;
    }

    this.#runGlitchJumpInterval();
    this.#notify();
  }

  get remainingTimeMs() {
    return this.#startTime ? this.#calculateRemainingTimeMs() : null;
  }

  stop() {
    this.#status = GAME_STATUSES.COMPLETED;
    clearInterval(this.#glitchSetIntervalId);
    clearInterval(this.#gameTimerId);
    this.#notify();
  }

  restart() {
    this.#cleanup();
    this.#status = GAME_STATUSES.PENDING;
    this.#notify();
  }

  #cleanup() {
    this.#startTime = null;
    this.#gameResult = null;
    this.#notify();
  }

  applySettings(settings) {
    this.#settings.apply(settings);
    this.#notify();
  }

  getCatcherScore(catcherId) {
    return this.#score.get(catcherId).points ?? 0;
  }

  isGameOverByTime() {
    if (typeof this.#startTime !== 'number') return false;
    return (Date.now() - this.#startTime) > this.#settings.gameTime;
  }

  toggleSoundSetting() {
    this.#settings.toggleSound();
    this.#notify();
  }

  subscribe(newSubscriber) {
    this.#subscribers.push(newSubscriber);
    return () => {
      this.#subscribers = this.#subscribers.filter(s => s !== newSubscriber);
    };
  }

  unsubscribe(subscriber) {
    this.#subscribers.filter(s => s !== subscriber);
  }

  #notify() {
    this.#subscribers.forEach(s => s());
  }

  #win(catcherId) {
    const result = {
      outcome: 'win' ,
      winnerId: catcherId ,
      stats: this.#score.get(catcherId)
    };
    this.#gameResult = result;
    this.#notify();
    return result;
  }

  #lose() {
    const result = {
      outcome: 'lose' ,
      winnerId: null ,
      stats: null
    };
    this.#gameResult = result;
    this.#notify();
    return result;
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

  #initializeScoreMap() {
    this.#score = new Map();

    for (const [id] of this.#catchers) {
      this.#score.set(id , { points: 0 , currentStrike: 0 });
    }
  }

  #isInsideSky(newPosition) {
    return 0 <= newPosition.x && newPosition.x < this.settings.skySize.columnsCount
      && 0 <= newPosition.y && newPosition.y < this.settings.skySize.rowsCount;
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
      this.#wasSkyExit = true;
      this.#updateScore(catcherId , SCORE_RULES.OUT_OF_BOUNDS_PENALTY);
      return;
    }

    if (this.#isCellBusyByOtherCatcher(newPosition , catcherId)) {
      this.#updateScore(catcherId , SCORE_RULES.CELL_CONFLICT_PENALTY);
      return;
    }

    catcher.position = newPosition;
    this.#notify();


    const wasGlitchCaught = this.#isGlitchBeingCaught(catcherId);
    if (wasGlitchCaught) {
      this.#wasGlitchCaught = true;
      this.#updateScore(catcherId , SCORE_RULES.GLITCH_CATCH_REWARD);
      this.#notify();

      if (this.getCatcherScore(catcherId) >= this.#settings.pointsToWin.getPoints()) {
        this.#win(catcherId);
        this.stop();

        this.#notify();
      }
    }

    this.#updateGlitchStrike(catcherId , wasGlitchCaught);
  }

  getGlitchStrike(catcherId) {
    return this.#score.get(catcherId)?.currentStrike ?? 0;
  }

  #isCellBusyByOtherCatcher(newPosition , catcherId) {
    for (const [id , catcher] of this.#catchers.entries()) {
      if (catcherId !== id && catcher.position.equals(newPosition)) {
        this.#wasCatcherCollision = true;
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
    const currentScore = this.#score.get(catcherId) ?? { points: 0 , currentStrike: 0 };
    const updatedScore = {
      ...currentScore ,
      points: currentScore.points + delta
    };
    this.#score.set(catcherId , updatedScore);
    this.#notify();
  }

  #updateGlitchStrike(catcherId , wasGlitchCaught) {
    const currentScore = this.#score.get(catcherId) ?? { points: 0 , currentStrike: 0 };

    const updatedScore = {
      points: currentScore.points ,
      currentStrike: wasGlitchCaught
                     ? currentScore.currentStrike + 1
                     : currentScore.currentStrike - 1
    };

    this.#applyGlitchStrikeEffects(updatedScore);

    this.#score.set(catcherId , updatedScore);
    this.#notify();
  }

  #applyGlitchStrikeEffects(score) {
    if (score.currentStrike === SCORE_RULES.GLITCH_FAST_CATCH_THRESHOLD) {
      score.points += SCORE_RULES.GLITCH_FAST_CATCH_BONUS;
      score.currentStrike = 1;
    }

    if (score.currentStrike === SCORE_RULES.GLITCH_MISS_THRESHOLD) {
      score.points -= SCORE_RULES.GLITCH_MISS_PENALTY;
      score.currentStrike = 0;
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
    this.#score.set(catcherId , { points: score , currentStrike: strike });
  }

  __forceStartTime(ms) {
    this.#startTime = ms;
  }
}
