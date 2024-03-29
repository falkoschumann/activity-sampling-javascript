export class OutputTracker {
  /** @type {EventTarget} */ #eventTarget;
  /** @type {string} */ #event;
  /** @type {Function} */ #tracker;
  #data = [];

  static create(
    /** @type {EventTarget} */ eventTarget,
    /** @type {string} */ event,
  ) {
    return new OutputTracker(eventTarget, event);
  }

  constructor(
    /** @type {EventTarget} */ eventTarget,
    /** @type {string} */ event,
  ) {
    this.#eventTarget = eventTarget;
    this.#event = event;
    this.#tracker = (event) => this.#data.push(event.detail);

    this.#eventTarget.addEventListener(this.#event, this.#tracker);
  }

  get data() {
    return this.#data;
  }

  clear() {
    let result = [...this.#data];
    this.#data.length = 0;
    return result;
  }

  stop() {
    this.#eventTarget.removeEventListener(this.#event, this.#tracker);
  }
}
