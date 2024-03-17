import { store } from './actions.js';
import { Component } from './component.js';

export class StateComponent extends Component {
  #unsubscribeStore;

  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.#unsubscribeStore = store.subscribe(() => this.updateView());
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
  }

  updateView() {
    this.state = this.extractState(store.getState());
    if (this.state === this.oldState) {
      return;
    }

    super.updateView();
    this.oldState = this.state;
  }

  extractState(state) {
    return state;
  }
}
