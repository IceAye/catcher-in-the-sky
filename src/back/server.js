import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/src', express.static(path.join(__dirname, '../../src')));

const server = https.createServer(app);

/** @type {import('ws').WebSocketServer} */
const wsServer = new WebSocketServer({ server });

// {channel1, channel2, game}
const pairs = [
]


console.log('WebSocket server initializing...');

process.on('uncaughtException' , (err) => {
  console.error('Uncaught exception:' , err);
});

wsServer.on('connection' , (channel) => {
  console.log(`WebSocket server listening on port ${PORT}`);

  channel.on('error' , console.error);


  let currentPair = pairs.find(pair => pair.channel2 === null);

  if (currentPair) {
    currentPair.channel2 = channel;
    currentPair.channel1.send(JSON.stringify({ type: EVENTS.SECOND_CATCHER_CONNECTED }));
    channel.send(JSON.stringify({ type: EVENTS.ROLE_ASSIGNED, role: 'catcherTwo' }));

  } else {
    const numberUtility = new NumberUtility();
    const game = new Game(numberUtility);

    currentPair = {
      channel1: channel,
      channel2: null,
      game: game
    }
    channel.send(JSON.stringify({ type: EVENTS.ROLE_ASSIGNED, role: 'catcherOne' }));

    pairs.push(currentPair);
  }

  function sendStateToClient() {
    channel.send(JSON.stringify({
                                  status: currentPair.game.status ,
                                  glitchPosition: { ...currentPair.game.glitchPosition } ,
                                  catcherOnePosition: { ...currentPair.game.catcherOnePosition } ,
                                  catcherTwoPosition: { ...currentPair.game.catcherTwoPosition } ,
                                  wasGlitchCaught: currentPair.game.wasGlitchCaught ,
                                  wasCatcherCollision: currentPair.game.wasCatcherCollision ,
                                  wasSkyExit: currentPair.game.wasSkyExit ,
                                  gameResult: currentPair.game.getGameResult() ? { ...currentPair.game.getGameResult() } : null ,
                                  score: Array.from(currentPair.game.getScore()) ,
                                  remainingGameTimeMs: currentPair.game.remainingTimeMs ,
                                  settings: currentPair.game.settings
                                }));
  }

  currentPair.game.subscribe(() => {
    sendStateToClient();
  });

  sendStateToClient();

  channel.on('message' , (message) => {
    try {
      const action = JSON.parse(message);
      console.log('Received action: ' , action);

      switch (action.type) {
        case ACTIONS.START:
          currentPair.game.start();
          break;
        case ACTIONS.MOVE_CATCHER:
          currentPair.game.moveCatcher(action.payload.catcherId , action.payload.direction);
          break;
        case ACTIONS.RESTART:
          currentPair.game.restart();
          break;
        case ACTIONS.START_GAME_TIMER:
          currentPair.game.startGameTimer();
          break;
        case ACTIONS.TOGGLE_SOUND:
          currentPair.game.toggleSoundSetting();
          break;
        case ACTIONS.APPLY_SETTINGS:
          currentPair.game.applySettings(action.payload);
          break;
        default:
          console.warn('Unknown action type, ' , action.type);
      }
    } catch (error) {
      console.error('Invalid message format' , error);
    }
  });

  channel.on('close', () => {
    const pair = pairs.find(p => p.channel1 === channel || p.channel2 === channel);
    if (pair) {
      if (pair.channel1 === channel) pair.channel1 = null;
      if (pair.channel2 === channel) pair.channel2 = null;
    }
  });

});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log((`Server is on port ${PORT}`)));