import { html, render } from 'lit-html';

import { store } from './actions.js';

export class Component extends HTMLElement {
  #debugging = new Debugging(this);

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.#debugging.beginGroup('connectedCallback');
    this.unsubscribe = store.subscribe(() => this.updateView());
    this.#debugging.log('Subscribed to store.');
    this.updateView();
    this.#debugging.endGroup();
  }

  disconnectedCallback() {
    this.#debugging.beginGroup('disconnectedCallback');
    this.unsubscribe();
    this.#debugging.log('Unsubscribed from store.');
    this.#debugging.endGroup();
  }

  updateView() {
    this.#debugging.beginGroup('updateView');
    this.#debugging.log('State before extraction:', store.getState());
    this.state = this.extractState(store.getState());
    if (this.state === this.oldState) {
      this.#debugging.log('Skip update because state has not changed.');
      this.#debugging.endGroup();
      return;
    }

    this.#debugging.log('State after extraction:', this.state);
    const template = this.getView();
    this.#debugging.log('Template created.');
    render(template, this.getRenderTarget());
    this.#debugging.log('Template rendered.');
    this.oldState = this.state;
    this.#debugging.endGroup();
  }

  extractState(state) {
    return state;
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}

class Debugging {
  static enabled = true;
  #label;

  constructor(type) {
    this.#label = type.constructor.name;
  }

  log(...args) {
    if (!Debugging.enabled) return;

    console.log(...args);
  }

  beginGroup(name) {
    if (!Debugging.enabled) return;

    console.group(`${this.#label}.${name}`);
  }

  endGroup() {
    if (!Debugging.enabled) return;

    console.groupEnd();
  }
}
