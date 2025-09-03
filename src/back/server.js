import { WebSocketServer } from 'ws';
import { NumberUtility } from '../shared/utils/number-utility.js';
import { Game } from './models/game.js';

/** @type {import('ws').WebSocketServer} */
const wsServer = new WebSocketServer({ port: 8080 });

// const pairs = [
//  {channel1, channel2, game}
// ]


console.log('WebSocket server initializing...');

process.on('uncaughtException' , (err) => {
  console.error('Uncaught exception:' , err);
});

const numberUtility = new NumberUtility();
const game = new Game(numberUtility);

wsServer.on('connection' , (channel) => {
  console.log('WebSocket server listening on port 8080');

  channel.on('error' , console.error);


  // let currentPair = pairs.find(pair => pair.channel2 === null);
  //
  // if (currentPair) {
  //   currentPair.channel2 = channel;
  //   currentPair.game.start()
  // } else {
  //   const numberUtility = new NumberUtility();
  //   const game = new Game(numberUtility);
  //
  //   currentPair = {
  //     channel1: channel,
  //     channel2: null,
  //     game: game
  //   }
  //
  //   pairs.push(currentPair);
  // }
  // function sendStateToClient() {
  //   channel.send(JSON.stringify({
  //                                 status: currentPair.game.status ,
  //                                 glitchPosition: { ...currentPair.game.glitchPosition } ,
  //                                 catcherOnePosition: { ...currentPair.game.catcherOnePosition } ,
  //                                 catcherTwoPosition: { ...currentPair.game.catcherTwoPosition }
  //                               }));
  // }


  function sendStateToClient() {
    channel.send(JSON.stringify({
                                  status: game.status ,
                                  glitchPosition: { ...game.glitchPosition } ,
                                  catcherOnePosition: { ...game.catcherOnePosition } ,
                                  catcherTwoPosition: { ...game.catcherTwoPosition } ,
                                  wasGlitchCaught: game.wasGlitchCaught ,
                                  wasCatcherCollision: game.wasCatcherCollision ,
                                  wasSkyExit: game.wasSkyExit ,
                                  gameResult: game.getGameResult() ? { ...game.getGameResult() } : null ,
                                  score: Array.from(game.getScore()) ,
                                  remainingGameTimeMs: game.remainingTimeMs ,
                                  settings: game.settings
                                }));
  }

  // currentPair.game.subscribe(() => {
  //   sendStateToClient();
  // });

  game.subscribe(() => {
    sendStateToClient();
  });

  sendStateToClient();

  channel.on('message' , (message) => {
    try {
      const action = JSON.parse(message);
      console.log('Received action: ' , action);

      switch (action.type) {
        case 'START':
          game.start();
          break;
        case 'MOVE_CATCHER':
          // if (channel === currentPair.channel1) {
          //   currentPair.game.moveCatcher(1, action.payload.direction);
          // } else {
          //   currentPair.game.moveCatcher(2, action.payload.direction);
          // }
          game.moveCatcher(action.payload.catcherId , action.payload.direction);
          break;
        case 'RESTART':
          game.restart();
          break;
        case 'START_GAME_TIMER':
          game.startGameTimer();
          break;
        case 'TOGGLE_SOUND':
          game.toggleSoundSetting();
          break;
        default:
          console.warn('Unknown action type, ' , action.type);
      }
    } catch (error) {
      console.error('Invalid message format' , error);
    }
  });

});