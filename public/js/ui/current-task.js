import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

class CurrentTask extends Component {
  #interval;

  async connectedCallback() {
    super.connectedCallback();
    //this.#interval = setInterval(() => this.#tick(), 1000);
  }

  #tick() {
    actions.progressTicked({ seconds: 1 });
  }

  async disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.#interval);
  }

  extractState(state) {
    return state.currentTask;
  }

  getView() {
    return html`
      <span class="caption">${this.state.remainingTime}</span>
      <progress max="1" value="${this.state.progress}"></progress>
      <button aria-label="Start timer">
        <span class="material-icons">punch_clock</span>
      </button>
    `;
  }
}

window.customElements.define('m-current-task', CurrentTask);
