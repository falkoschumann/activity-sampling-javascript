import actions from './actions.js';

export class Clock extends EventTarget {
  #timerId;

  start() {
    this.#timerId = setInterval(() => actions.clockTicked(new Date()), 1000);
  }

  stop() {
    clearInterval(this.#timerId);
  }
}
