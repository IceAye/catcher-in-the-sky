import { GAME_STATUSES , MOVE_DIRECTIONS } from './shared/constants.js';
import { Settings } from './shared/settings.js';
import { Catcher } from './catcher.js';
import { Glitch } from './glitch.js';

export class Game {
  #status = GAME_STATUSES.PENDING;
  #glitch;
  #catchers = new Map();
  #catcherOne;
  #catcherTwo;
  #settings;
  #numberUtility;

  #glitchJump() {
    this.#glitch.position = this.#numberUtility.getRandomPosition(
      [this.#catcherOne.position , this.#catcherTwo.position , this.#glitch.position] , this.settings.skySize);
  }



  #createUnits() {
    const catcherOneStartPosition = this.#numberUtility.getRandomPosition([] , this.settings.skySize);
    const one = new Catcher(1 , catcherOneStartPosition);
    this.#catcherOne = one;

    const catcherTwoStartPosition = this.#numberUtility.getRandomPosition([catcherOneStartPosition] ,
                                                                          this.settings.skySize);
    const two = new Catcher(2 , catcherTwoStartPosition);
    this.#catcherTwo = two;

    this.#catchers.set(1, one);
    this.#catchers.set(2, two);

    const glitchStartPosition = this.#numberUtility.getRandomPosition(
      [catcherOneStartPosition , catcherTwoStartPosition] , this.settings.skySize);

    this.#glitch = new Glitch(glitchStartPosition);
  }

  #isInsideSky(newPosition) {
    return 0 <= newPosition.x && newPosition.x < this.settings.skySize.columnsCount
      && 0 <= newPosition.y && newPosition.y < this.settings.skySize.rowsCount;
  }

  #isCellBusyByOtherCatcher(newPosition, catcherId) {
    for (const [id, catcher] of this.#catchers.entries()) {
      if (catcherId !== id && catcher.position.equals(newPosition)) {
        return true;
      }
    }
    return false;
  }

  // dependency injection
  constructor(numberUtility , gameSettings) {
    this.#numberUtility = numberUtility;
    this.#settings = new Settings(gameSettings);
  }

  // post
  start() {
    if (this.#status === GAME_STATUSES.PENDING) {
      this.#createUnits();
      this.#status = GAME_STATUSES.IN_PROGRESS;
    }

    this.#glitchJump();

    setInterval(() => {
      this.#glitchJump();
    } , this.#settings.glitchJumpInterval);
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

    if (!this.#isInsideSky(newPosition)) return;
    if (this.#isCellBusyByOtherCatcher(newPosition, catcherId)) return;

    catcher.position = newPosition;
  }

  get status() {
    return this.#status;
  }

  get settings() {
    return {
      ...this.#settings ,
      skySize: {
        ...this.#settings.skySize
      }
    };
  }

  set settings(settings) {
    if (settings.skySize && settings.skySize.rowsCount * settings.skySize.columnsCount < 4) {
      throw new RangeError('The size of the sky should be bigger');
    }
    this.#settings = {
      ...this.#settings ,
      skySize: settings.skySize ? { ...settings.skySize } : this.#settings.skySize ,
      glitchJumpInterval: settings.glitchJumpInterval
                          ? settings.glitchJumpInterval
                          : this.#settings.glitchJumpInterval
    };
  }

  get catcherOne() {
    return this.#catcherOne;
  }

  get catcherTwo() {
    return this.#catcherTwo;
  }

  get glitch() {
    return this.#glitch;
  }

  get glitchPosition() {
    return this.#glitch.position;
  }

  set glitchPosition(newPosition) {
    this.#glitch.position = newPosition;
  }

  get catcherOnePosition() {
    return this.#catcherOne.position;
  }

  set catcherOnePosition(newPosition) {
    this.#catcherOne.position = newPosition;
  }

  get catcherTwoPosition() {
    return this.#catcherTwo.position;
  }
}
