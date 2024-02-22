export class Clock {
  static create() {
    return new Clock();
  }

  static createNull({ fixed = new Date('2024-02-21T19:16:00Z') } = {}) {
    return new Clock(fixed);
  }

  #date;

  constructor(/** @type {Date|number|null} */ date) {
    this.#date = date;
  }

  date() {
    return this.#date ? new Date(this.#date) : new Date();
  }
}
