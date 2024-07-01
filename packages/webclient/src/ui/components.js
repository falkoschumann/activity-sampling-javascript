import { html, render } from 'lit-html';

import { Services } from '../application/services.js';

export class Component extends HTMLElement {
  connectedCallback() {
    this.updateView();
  }

  updateView() {
    if (!this.isConnected) {
      return;
    }

    render(this.getView(), this.getRenderTarget());
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}

export class Container extends Component {
  static #services = Services.create();
  #unsubscribeStore;

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  get services() {
    return Container.#services;
  }

  connectedCallback() {
    this.#unsubscribeStore = this.services.store.subscribe(() =>
      this.updateView(),
    );
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
  }

  updateView({ force = false } = {}) {
    this.state = this.extractState(this.services.store.getState());
    if (!force && this.state === this.oldState) {
      return;
    }

    super.updateView();
    this.oldState = this.state;
  }

  extractState(state) {
    return state;
  }
}
