import { GAME_STATUSES } from './shared/constants.js';
import { Position } from './position.js';
import { Settings } from './shared/settings.js';
import { Catcher } from './catcher.js';
import { Glitch } from './glitch.js';

export class Game {
  #status = GAME_STATUSES.PENDING;
  #glitch;
  #catcherOne;
  #catcherTwo;
  #settings;
  #numberUtility;


  #getRandomPosition(coordinates) {
    let newX;
    let newY;

    do {
      newX = this.#numberUtility.getRandomIntegerNumber(0 , this.#settings.skySize.columnsCount);
      newY = this.#numberUtility.getRandomIntegerNumber(0 , this.#settings.skySize.rowsCount);
    } while (coordinates.some((el) => el.x === newX && el.y === newY));

    return new Position(newX , newY);
  }

  #glitchJump() {
    this.glitchPosition = this.#getRandomPosition([this.catcherOne.position, this.catcherTwo.position, this.glitch.position]);
  }

  #createUnits() {
    const catcherOneStartPosition = this.#getRandomPosition([]);
    this.#catcherOne = new Catcher(1 , catcherOneStartPosition);

    const catcherTwoStartPosition = this.#getRandomPosition([catcherOneStartPosition]);
    this.#catcherTwo = new Catcher(2 , catcherTwoStartPosition);

    const glitchStartPosition = this.#getRandomPosition([catcherOneStartPosition, catcherTwoStartPosition]);

    this.#glitch = new Glitch(glitchStartPosition);
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
}
