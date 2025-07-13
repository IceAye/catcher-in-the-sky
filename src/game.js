import { GAME_STATUSES } from './shared/constants.js';
import { Position } from './position.js';
import { Settings } from './shared/settings.js';
import { Catcher } from './catcher.js';
import { Glitch } from './glitch.js';

export class Game {
  #status = GAME_STATUSES.PENDING;
  #glitch = new Glitch(null);
  #glitchPosition = null;
  #catcherOne;
  #catcherTwo;
  #settings;
  #numberUtility;


  #getRandomPosition() {
    let newX;
    let newY;

    do {
      newX = this.#numberUtility.getRandomIntegerNumber(0, this.#settings.skySize.columnsCount);
      newY = this.#numberUtility.getRandomIntegerNumber(0, this.#settings.skySize.rowsCount);
    } while (newX === this.#catcherOne.position.x && newY === this.#catcherOne.position.y);

    return new Position(newX, newY);
  }

  #glitchJump() {
    const newPosition = new Position(
      this.#numberUtility.getRandomIntegerNumber(0 , this.#settings.skySize.columnsCount) ,
      this.#numberUtility.getRandomIntegerNumber(0 , this.#settings.skySize.rowsCount)
    );

    if (newPosition.x === this.#glitchPosition?.x && newPosition.y === this.#glitchPosition?.y) {
      return this.#glitchJump();
    }

    this.#glitchPosition = newPosition;
  }

  //TODO a separate method:
  #createCatchers() {
    const catcherOnePosition = new Position(this.#numberUtility.getRandomIntegerNumber(0 , this.settings.skySize.columnsCount) ,
                                            this.#numberUtility.getRandomIntegerNumber(0 , this.settings.skySize.rowsCount)
    )
    this.#catcherOne = new Catcher(
      1 ,

    );
    this.#catcherTwo = new Catcher(2, this.#getRandomPosition());
  }

  // dependency injection
  constructor(numberUtility , gameSettings) {
    this.#numberUtility = numberUtility;
    this.#settings = new Settings(gameSettings);

  }

  // post
  start() {
    this.#status = GAME_STATUSES.IN_PROGRESS;
    this.#glitchJump();

    setInterval(() => {
      this.#glitchJump();
    } , this.#settings.glitchJumpInterval);
  }

  get status() {
    return this.#status;
  }

  get glitchPosition() {
    return this.#glitchPosition;
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
}
