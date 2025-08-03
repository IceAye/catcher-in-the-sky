import { NumberUtility } from './shared/number-utility.js';
import { Game } from './back/models/game.js';
import { View } from './View.js';
import { Controller } from './Controller.js';

const numberUtility = new NumberUtility();
const game = new Game(numberUtility);
const view = new View();
const controller = new Controller(game, view);

controller.init();
