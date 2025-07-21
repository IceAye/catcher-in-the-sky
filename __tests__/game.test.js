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
    game = new Game(randomNumber , new Settings({ skySize: new SkySize() }));
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

  it('Sky size settings should be set' , () => {
    // default settings
    expect(game.settings).toEqual({
                                    skySize: {
                                      columnsCount: 4 ,
                                      rowsCount: 4
                                    } ,
                                    glitchSpeedJump: {
                                      level: 'junior' ,
                                      interval: 1200
                                    }
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
      glitchSpeedJump: {
        level: 'amateur' ,
        interval: 800
      }
    };

    expect(game.settings.skySize).toEqual({
                                            columnsCount: 4 ,
                                            rowsCount: 4
                                          });
    expect(game.settings.glitchSpeedJump.level).toBe('amateur');
    expect(game.settings.glitchSpeedJump.interval).toBe(800);
  });

  it('Glitch should change its position in specified interval' , async () => {
    game.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 2
      } ,
      glitchSpeedJump: {
        level: 'pro' ,
        interval: 400
      }

    };
    game.start();

    for (let i = 0; i <= 4; i++) {
      const position1 = game.glitchPosition;
      await delay(game.settings.glitchSpeedJump.interval);
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
      glitchSpeedJump: {
        level: 'amateur' ,
        interval: 10000
      }
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

  it('should check Glitch being caught by a Catcher' , () => {
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
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 1 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 1 });

    expect(testGame.glitchPosition.equals(testGame.catcherOnePosition)).toBe(true);
  });

  it('should update the Catcher\'s score after catching Glitch' , () => {
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
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 1 });

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 1 , y: 1 });

    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(15);
  });

  it('should award bonus after 3 consecutive Glitch catches' , async () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(1 , 1) , // CatcherOne
                                                      new Position(0 , 2) , // CatcherTwo
                                                      new Position(1 , 2) , // Glitch jump #1
                                                      new Position(1 , 1) , // Glitch jump #2
                                                      new Position(1 , 2)  // Glitch jump #3
                                                    ]));

    testGame.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      } ,
      glitchSpeedJump: {
        level: 'amateur' ,
        interval: 1
      }
    };

    testGame.start();

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.getCatcherScore(1)).toEqual(15);
    expect(testGame.getGlitchStrike(1)).toEqual(1);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.getCatcherScore(1)).toEqual(30);
    expect(testGame.getGlitchStrike(1)).toEqual(2);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.getCatcherScore(1)).toEqual(65);
    expect(testGame.getGlitchStrike(1)).toEqual(0);
  });

  it('should reset Glitch strike when Catcher fails to catch' , async () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(1 , 1) , // CatcherOne
                                                      new Position(2 , 2) , // CatcherTwo (в стороне)
                                                      new Position(1 , 2) , // Glitch jump #1
                                                      new Position(1 , 1) , // Glitch jump #2
                                                      new Position(0 , 0)  // Glitch jump #3 → вне досягаемости
                                                    ]));

    testGame.settings = {
      skySize: {
        columnsCount: 3 ,
        rowsCount: 3
      } ,
      glitchSpeedJump: {
        level: 'amateur' ,
        interval: 1
      }
    };

    testGame.start();

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.getCatcherScore(1)).toEqual(15);
    expect(testGame.getGlitchStrike(1)).toEqual(1);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.getCatcherScore(1)).toEqual(30);
    expect(testGame.getGlitchStrike(1)).toEqual(2);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.getCatcherScore(1)).toEqual(30);
    expect(testGame.getGlitchStrike(1)).toEqual(0);
  });


});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve , ms));

