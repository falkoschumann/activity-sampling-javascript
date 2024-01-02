import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

class CurrentTask extends Component {
  disconnectedCallback() {
    super.disconnectedCallback();
    actions.stopTimer();
  }

  extractState(state) {
    return state.currentTask;
  }

  getView() {
    return html`
      <span class="caption">${this.state.remainingTime}</span>
      <progress max="1" value="${this.state.progress}"></progress>
      <button
        id="toggle-timer"
        aria-label="Start timer"
        @click=${this.#handleToggleTimer}
      >
        <span class="material-icons">punch_clock</span>
      </button>
    `;
  }

  #handleToggleTimer = () => {
    let button = this.querySelector('#toggle-timer');
    if (this.state.isTimerRunning) {
      actions.stopTimer();
      button.setAttribute('aria-label', 'Start timer');
      button.setAttribute('aria-pressed', 'false');
    } else {
      actions.startTimer();
      button.setAttribute('aria-label', 'Stop timer');
      button.setAttribute('aria-pressed', 'true');
    }
  };
}

window.customElements.define('m-current-task', CurrentTask);
