export class Timer {
  #timerId;

  start(task, delay) {
    this.#timerId = setInterval(task, delay);
  }

  stop() {
    clearInterval(this.#timerId);
    this.#timerId = null;
  }
}
