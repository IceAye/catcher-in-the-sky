import { Unit } from './unit.js';

export class Catcher extends Unit {
  constructor(id, position) {
    super(position);
    this.id = id;
  }
}
