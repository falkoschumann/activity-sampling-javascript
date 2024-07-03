import { html, render } from 'lit-html';

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
  static initStore(store) {
    Container.#store = store;
  }

  static #store;

  #unsubscribeStore;

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.#unsubscribeStore = Container.#store.subscribe(() =>
      this.updateView(),
    );
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
  }

  updateView({ force = false } = {}) {
    if (!this.isConnected) {
      return;
    }

    this.state = this.extractState(Container.#store.getState());
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
