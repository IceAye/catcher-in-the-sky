import { View } from './View.js';
import { Controller } from './Controller.js';
import { ModelRemoteProxy } from './ModelRemoteProxy.js';

const modelRemoteProxy = new ModelRemoteProxy();

const view = new View();
const controller = new Controller(modelRemoteProxy, view);

controller.init();