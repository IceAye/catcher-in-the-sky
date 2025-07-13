import { NumberUtility } from '../src/number-utility.js';
import { Game } from '../src/game.js';
import { GAME_STATUSES } from '../src/shared/constants.js';
import { Settings } from '../src/shared/settings.js';
import { SkySize } from '../src/skySize.js';

describe('game', () => {
  let game;

  beforeEach(() => {
    const randomNumber = new NumberUtility();
    game = new Game(randomNumber, new Settings(new SkySize()));
  });

  it('should start', () => {
    expect(game.status).toBe(GAME_STATUSES.PENDING);

    game.start();
    expect(game.status).toBe(GAME_STATUSES.IN_PROGRESS);
  });

  it('CatcherOne should be placed on the sky after start', () => {
    game.settings = {
      skySize: {
        columnsCount: 3,
        rowsCount: 2
      }
    };

    game.start();

    console.log(game.settings);

    expect(game.catcherOne.position.x).toBeGreaterThanOrEqual(0);
    expect(game.catcherOne.position.x).toBeLessThan(3);

    expect(game.catcherOne.position.y).toBeGreaterThanOrEqual(0);
    expect(game.catcherOne.position.y).toBeLessThan(2);
  });

  it('CatcherTwo should be placed on the sky and have distinct positions with CatcherOne', () => {
    game.settings = {
      skySize: {
        columnsCount: 3,
        rowsCount: 2
      }
    };

    game.start();

    expect(game.catcherTwo).toBeDefined();
    expect(game.catcherTwo.position.x).toBeGreaterThanOrEqual(0);
    expect(game.catcherTwo.position.x).toBeLessThan(3);
    expect(game.catcherTwo.position.y).toBeGreaterThanOrEqual(0);
    expect(game.catcherTwo.position.y).toBeLessThan(2);

    const { x: x1, y: y1 } = game.catcherOne.position;
    const { x: x2, y: y2 } = game.catcherTwo.position;

    expect(x1 !== x2 || y1 !== y2).toBe(true);
  });




  it('settings should be set', () => {
    // default settings
    expect(game.settings).toEqual({
      skySize: {
        columnsCount: 4,
        rowsCount: 4
      },
      glitchJumpInterval: 1000
    });

    // didn't change because of deep copy
    game.settings.skySize.columnsCount = -1000;

    game.settings = {
      skySize: {
        columnsCount: 3,
        rowsCount: 3
      }
    };
    expect(game.settings.skySize).toEqual({ columnsCount: 3, rowsCount: 3 });
  });

  it('settings should be set partially', () => {
    game.settings = {
      glitchJumpInterval: 1
    };

    expect(game.settings.skySize).toEqual({
      columnsCount: 4,
      rowsCount: 4
    });
    expect(game.settings.glitchJumpInterval).toEqual(1);
  });

  it('Glitch should change its position in specified interval', async () => {
    game.settings = {
      skySize: {
        columnsCount: 3,
        rowsCount: 2
      },
      glitchJumpInterval: 1
    };
    game.start();

    for (let i = 0; i <= 10; i++) {
      const position1 = game.glitchPosition;
      await delay(1);
      const position2 = game.glitchPosition;
      expect(position1).not.toEqual(position2);
    }
  });
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
