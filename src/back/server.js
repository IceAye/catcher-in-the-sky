import { WebSocketServer } from 'ws';
import { NumberUtility } from '../shared/utils/number-utility.js';
import { Game } from './models/game.js';

/** @type {import('ws').WebSocketServer} */
const wsServer = new WebSocketServer({ port: 8080 });

const numberUtility = new NumberUtility();
const game = new Game(numberUtility);

console.log('WebSocket server initializing...');

process.on('uncaughtException' , (err) => {
  console.error('Uncaught exception:' , err);
});


wsServer.on('connection' , (channel) => {
  console.log('WebSocket server listening on port 8080');

  channel.on('error' , console.error);

  function sendStateToClient() {
    channel.send(JSON.stringify({
                                  status: game.status ,
                                  glitchPosition: { ...game.glitchPosition } ,
                                  catcherOnePosition: { ...game.catcherOnePosition } ,
                                  catcherTwoPosition: { ...game.catcherTwoPosition }
                                }));
  }

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
        case 'MOVE_CATCHER_ONE':
          game.moveCatcher(1 , action.payload.direction);
          break;
        default:
          console.warn('Unknown action type, ' , action.type);
      }
    } catch (error) {
      console.error('Invalid message format' , error);
    }
  });

});