export class ConfigurableResponses {
  static create(responses, /** @type {string} */ name) {
    return new ConfigurableResponses(responses, name);
  }

  #description;
  #responses;

  constructor(responses, /** @type {string} */ name) {
    this.#description = name == null ? '' : ` in ${name}`;
    this.#responses = Array.isArray(responses) ? [...responses] : responses;
  }

  next() {
    const response = Array.isArray(this.#responses)
      ? this.#responses.shift()
      : this.#responses;
    if (response === undefined) {
      throw new Error(`No more responses configured${this.#description}.`);
    }

    return response;
  }
}
