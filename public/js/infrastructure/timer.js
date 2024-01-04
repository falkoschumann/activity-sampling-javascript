export class Timer {
  #task;
  #delay;
  #timerId;

  constructor(task, seconds = 1) {
    this.#task = task;
    this.#delay = seconds;
  }

  start() {
    this.#timerId = setInterval(
      () => this.#task(this.#delay),
      this.#delay * 1000,
    );
  }

  stop() {
    clearInterval(this.#timerId);
    this.#timerId = null;
  }
}
