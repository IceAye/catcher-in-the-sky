import { NumberUtility } from '../src/shared/utils/number-utility.js';
import { Game } from '../src/back/models/game.js';
import { GAME_STATUSES , MOVE_DIRECTIONS } from '../src/shared/constants.js';
import { Settings } from '../src/shared/settingsModule/settings.js';
import { SkySize } from '../src/config/sky-size.js';
import { Position } from '../src/config/position.js';
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

  it('Sky size settingsModule should be set' , () => {
    // default settingsModule
    expect(game.settings).toEqual({
                                    skySize: {
                                      columnsCount: 4 ,
                                      rowsCount: 4
                                    } ,
                                    glitchSpeedJump: {
                                      level: 'junior' ,
                                      interval: 1200
                                    } ,
                                    gameTime: 120000 ,
                                    soundEnabled: true,
                                    pointsToWin: {
                                      mode: 'duel',
                                      total: 150,
                                      presets: {
                                        blitz: 50 ,
                                        duel: 150 ,
                                        marathon: 300 ,
                                        custom: null
                                      }
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
    expect(game.settings.pointsToWin.mode).toBe('duel');
    expect(game.settings.pointsToWin.total).toBe(150);
  });


  it('settingsModule should be set partially' , () => {
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
    expect(game.settings.gameTime).toBe(120000);

    game.settings = {
      gameTime: 180000 // 3 min
    };

    expect(game.settings.gameTime).toBe(180000);

    game.settings = {
      pointsToWin: {
        mode: 'blitz'
      }
    }
    expect(game.settings.pointsToWin.mode).toBe('blitz');

    game.settings = {
      pointsToWin: {
        mode: 'custom',
        customPoints: 220
      }
    }
    expect(game.settings.pointsToWin.mode).toBe('custom')
    expect(game.settings.pointsToWin.total).toBe(220)
  });

  it('sound should be enabled and disabled by user' , () => {
    game.start();
    expect(game.settings).toHaveProperty('soundEnabled');
    expect(game.settings.soundEnabled).toBeDefined();
    expect(game.settings.soundEnabled).toBeTruthy();

    game.toggleSound();
    expect(game.settings.soundEnabled).toBeDefined();
    expect(game.settings.soundEnabled).toBeFalsy();

    game.toggleSound();
    expect(game.settings.soundEnabled).toBeDefined();
    expect(game.settings.soundEnabled).toBeTruthy();
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
      } ,
      soundEnabled: true
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
    expect(testGame.getGlitchStrike(1)).toEqual(1);
  });

  it('should decrease Glitch strike when Catcher fails to catch' , async () => {
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
    expect(testGame.getGlitchStrike(1)).toEqual(1);
  });

  it('Catcher should receive penalty when attempting to move outside the sky' , () => {
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
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });
    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(-5);

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });
    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(-10);

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });
    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(-15);
  });

  it('Catcher should receive penalty when attempting to move to occupied cell' , () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(2 , 2) , // CatcherOne
                                                      new Position(1 , 2) , // CatcherTwo
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
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 2 });
    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(-8);

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.catcherOnePosition).toEqual({ x: 2 , y: 1 });
    expect(testGame.getCatcherScore(testGame.catcherOne.id)).toEqual(-8);
  });

  it('Catcher should receive penalty for failing to catch Glitch 5 times in a row' , async () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(1 , 1) , // CatcherOne
                                                      new Position(2 , 2) , // CatcherTwo
                                                      new Position(1 , 2) , // Glitch jump #1
                                                      new Position(1 , 1) , // Glitch jump #2
                                                      new Position(2 , 0) , // Glitch jump #3
                                                      new Position(2 , 1) , // Glitch jump #4
                                                      new Position(0 , 2)  // Glitch jump #5
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

    testGame.moveCatcher(1 , MOVE_DIRECTIONS.UP);
    expect(testGame.getCatcherScore(1)).toEqual(0);
    expect(testGame.getGlitchStrike(1)).toEqual(-1);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.LEFT);
    expect(testGame.getCatcherScore(1)).toEqual(0);
    expect(testGame.getGlitchStrike(1)).toEqual(-2);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.getCatcherScore(1)).toEqual(0);
    expect(testGame.getGlitchStrike(1)).toEqual(-3);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.RIGHT);
    expect(testGame.getCatcherScore(1)).toEqual(0);
    expect(testGame.getGlitchStrike(1)).toEqual(-4);

    await delay(testGame.settings.glitchSpeedJump.interval);
    testGame.moveCatcher(1 , MOVE_DIRECTIONS.DOWN);
    expect(testGame.getCatcherScore(1)).toEqual(-3);
    expect(testGame.getGlitchStrike(1)).toEqual(0);

  });

  it('CatcherOne should win if score is reached' , () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(0 , 1) , // CatcherOne
                                                      new Position(2 , 2) , // CatcherTwo
                                                      new Position(0 , 0)  // Glitch
                                                    ]));

    testGame.settings = {
      gameTime: 120000 ,
      glitchJumpInterval: 1000000,
    };

    testGame.start();

    testGame.__forceScore(1 , 70);
    expect(testGame.getCatcherScore(1)).toBe(70);

    testGame.__forceScore(1 , 135);
    expect(testGame.getCatcherScore(1)).toBe(135);

    testGame.moveCatcher(1, MOVE_DIRECTIONS.UP);
    expect(testGame.getCatcherScore(1)).toBe(150);
    expect(testGame.status).toBe(GAME_STATUSES.COMPLETED);
  });

  it('should check if the game is over by time' , () => {
    game.__forceStartTime(Date.now() - 130000);
    expect(game.isGameOverByTime()).toBeTruthy();

    game.__forceStartTime(Date.now() - 90000);
    expect(game.isGameOverByTime()).toBeFalsy();
  });

  it('Glitch should win if time expired and no Catcher reached score target' , () => {
    const testGame = new Game(new MockNumberUtility([
                                                      new Position(1 , 1) , // CatcherOne
                                                      new Position(2 , 2) , // CatcherTwo
                                                      new Position(0 , 0)  // Glitch
                                                    ]));

    testGame.settings = {
      gameTime: 120000 ,
      glitchJumpInterval: 1000000
    };

    testGame.start();
    testGame.__forceScore(1 , 70);
    testGame.__forceScore(2, 75);
    testGame.__forceStartTime(Date.now() - 130000);

    expect(testGame.getCatcherScore(1)).toBe(70);
    expect(testGame.getCatcherScore(2)).toBe(75);
    expect(testGame.isGameOverByTime()).toBeTruthy();
  });

  it('should start the timer and change the time' , () => {
    jest.useFakeTimers();

    game.start();

    expect(game.remainingTimeMs).toBeNull();

    game.startGameTimer();
    jest.advanceTimersByTime(3000);
    expect(game.remainingTimeMs).toBeGreaterThan(0);
  });

  it('should set status to completed when stop is called',  () => {
    game.start();
    game.stop();

    expect(game.status).toBe(GAME_STATUSES.COMPLETED);
  });

  it('should call isGameOverByTime once, stop the game if time is over and change the final status', () => {
    jest.useFakeTimers();
    const spyOnGameOver = jest.spyOn(game, 'isGameOverByTime');

    game.start();
    game.startGameTimer();
    jest.setSystemTime(new Date(Date.now() + 130000));

    jest.advanceTimersByTime(1000);
    expect(spyOnGameOver).toHaveBeenCalled();
    expect(game.status).toBe(GAME_STATUSES.COMPLETED);
  });

  it('should change game status after restarting' , () => {
    game.start();
    game.startGameTimer();
    expect(game.status).toBe(GAME_STATUSES.IN_PROGRESS);

    game.stop();
    expect(game.status).toBe(GAME_STATUSES.COMPLETED);

    game.restart();
    expect(game.status).toBe(GAME_STATUSES.PENDING);

  });

  it('should clean up game intervals' , () => {
    jest.useFakeTimers();
    game.start();
    game.startGameTimer();
    jest.advanceTimersByTime(1000);

    const minutesInTimer = game.remainingTimeMs;
    const minutesInGameTime = game.settings.gameTime;
    expect(minutesInTimer).toBeLessThan(minutesInGameTime);

    game.restart();
    const minutesAfterRestart = game.remainingTimeMs;
    expect(minutesAfterRestart).toBeNull();
  });
});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve , ms));

