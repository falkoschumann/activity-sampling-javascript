export class ConfigurableResponses {
  /** @type {string} */ #description;
  /** @type {any|any[]|Error} */ #responses;

  static create(
    /** @type {any|any[]|Error} */ responses,
    /** @type {string} */ name,
  ) {
    return new ConfigurableResponses(responses, name);
  }

  constructor(
    /** @type {any|any[]|Error} */ responses,
    /** @type {string} */ name,
  ) {
    this.#description = name == null ? '' : ` in ${name}`;
    this.#responses = Array.isArray(responses) ? [...responses] : responses;
  }

  next() {
    let response = Array.isArray(this.#responses)
      ? this.#responses.shift()
      : this.#responses;
    if (response === undefined) {
      throw new Error(`No more responses configured${this.#description}.`);
    }

    if (response instanceof Error) {
      throw response;
    }

    return response;
  }
}
