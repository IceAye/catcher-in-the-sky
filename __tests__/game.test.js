import { NumberUtility } from '../src/number-utility.js';
import { Game } from '../src/game.js';
import { GAME_STATUSES , MOVE_DIRECTIONS } from '../src/shared/constants.js';
import { Settings } from '../src/shared/settings.js';
import { SkySize } from '../src/skySize.js';
import { Position } from '../src/position.js';
import { MockNumberUtility } from './utils/mock-number-utility.js';

describe('game' , () => {
  let game;

  beforeEach(() => {
    const randomNumber = new NumberUtility();
    game = new Game(randomNumber , new Settings(new SkySize()));
  });

  afterEach(async () => {
    await game.stop();
  });

  it('should start' , () => {
    expect(game.status).toBe(GAME_STATUSES.PENDING);

    game.start();
    expect(game.status).toBe(GAME_STATUSES.IN_PROGRESS);
  });

  it('CatcherOne should be placed on the sky after start' , () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      }
    };

    game.start();
    expect(game.catcherOne).toBeDefined();
    expect(game.catcherOnePosition.x).toBeGreaterThanOrEqual(0);
    expect(game.catcherOnePosition.x).toBeLessThan(3);

    expect(game.catcherOnePosition.y).toBeGreaterThanOrEqual(0);
    expect(game.catcherOnePosition.y).toBeLessThan(2);
  });

  it('CatcherTwo should be placed on the sky and have distinct positions with CatcherOne' , () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      }
    };

    game.start();

    expect(game.catcherTwo).toBeDefined();
    expect(game.catcherTwoPosition.x).toBeGreaterThanOrEqual(0);
    expect(game.catcherTwoPosition.x).toBeLessThan(3);
    expect(game.catcherTwoPosition.y).toBeGreaterThanOrEqual(0);
    expect(game.catcherTwoPosition.y).toBeLessThan(2);

    const { x: x1 , y: y1 } = game.catcherOnePosition;
    const { x: x2 , y: y2 } = game.catcherTwoPosition;

    expect(x1 !== x2 || y1 !== y2).toBe(true);
  });

  it('Glitch should be placed and have valid position' , () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      }
    };

    game.start();

    expect(game.glitch).toBeDefined();
    expect(game.glitchPosition.x).toBeGreaterThanOrEqual(0);
    expect(game.glitchPosition.x).toBeLessThan(3);
    expect(game.glitchPosition.y).toBeGreaterThanOrEqual(0);
    expect(game.glitchPosition.y).toBeLessThan(2);
  });

  it('Glitch should have distinct position' , () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      }
    };

    game.start();

    const { x: x1 , y: y1 } = game.catcherOnePosition;
    const { x: x2 , y: y2 } = game.catcherTwoPosition;
    const { x: x3 , y: y3 } = game.glitchPosition;

    expect(x1 !== x3 || y1 !== y3).toBe(true);
    expect(x2 !== x3 || y2 !== y3).toBe(true);
  });

  it('settings should be set' , () => {
    // default settings
    expect(game.settings).toEqual({
                                    skySize: {
                                      columnsCount: 4 ,
                                      rowsCount: 4
                                    } ,
                                    glitchJumpInterval: 1000
                                  });

    // didn't change because of deep copy
    game.settings.skySize.columnsCount = -1000;

    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      }
    };
    expect(game.settings.skySize).toEqual({ columnsCount: 3 , rowsCount: 3 });
  });

  it('settings should be set partially' , () => {
    game.settings = {
      glitchJumpInterval: 1
    };

    expect(game.settings.skySize).toEqual({
                                            columnsCount: 4 ,
                                            rowsCount: 4
                                          });
    expect(game.settings.glitchJumpInterval).toEqual(1);
  });

  it('Glitch should change its position in specified interval' , async () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      } ,
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

  it('CatcherOne should move in available direction' , () => {

    const testGame = new Game(new MockNumberUtility([
                                                      new Position(2 , 2) ,
                                                      new Position(0 , 2) ,
                                                      new Position(1 , 1)
                                                    ]));

    testGame.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      } ,
      glitchJumpInterval: 10000
    };

    testGame.start();

    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 1 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 1 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 0 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 0 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 0 , y: 0 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 0 , y: 0 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherOnePosition).toEqual({ x: 0 , y: 1 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 1 });

  });

  it('CatcherTwo should move in available direction and avoid collision with CatcherOne' , () => {

    const testGame = new Game(new MockNumberUtility([
                                                      new Position(2 , 2) , // CatcherOne
                                                      new Position(0 , 2) , // CatcherTwo
                                                      new Position(1 , 1)  // Glitch
                                                    ]));

    testGame.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      } ,
      glitchJumpInterval: 10000
    };

    testGame.start();

    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });
    expect(testGame.catcherTwoPosition).toEqual({ x: 0 , y: 2 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherTwoPosition).toEqual({ x: 0 , y: 1 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.catcherTwoPosition).toEqual({ x: 1 , y: 1 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherTwoPosition).toEqual({ x: 1 , y: 0 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.catcherTwoPosition).toEqual({ x: 2 , y: 0 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherTwoPosition).toEqual({ x: 2 , y: 1 });

    testGame.moveCatcher(2 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherTwoPosition).toEqual({ x: 2 , y: 1 });

  });

  it('should check Glitch catching by a Catcher' , () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(2 , 2) , // CatcherOne
                                                      new Position(0 , 2) , // CatcherTwo
                                                      new Position(1 , 1)  // Glitch
                                                    ]));

    testGame.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      } ,
      glitchJumpInterval: 1000000
    };

    testGame.start();
    testGame.moveCatcher(1, MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({x: 2, y: 1});

    testGame.moveCatcher(1, MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({x: 1, y: 1});

    expect(testGame.glitchPosition.equals(testGame.catcherOnePosition)).toBe(true);
  });

});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve , ms));
