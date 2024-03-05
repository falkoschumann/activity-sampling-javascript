import { html, nothing } from 'lit-html';

import actions from './actions.js';
import { Component } from './component.js';

class CurrentActivity extends Component {
  disconnectedCallback() {
    super.disconnectedCallback();
    actions.stopNotificationsRequested();
  }

  updateView() {
    super.updateView();
    this.querySelector('#client').value = this.state.client;
    this.querySelector('#project').value = this.state.project;
    this.querySelector('#task').value = this.state.task;
    this.querySelector('#notes').value = this.state.notes;
  }

  extractState(state) {
    return state.currentActivity;
  }

  getView() {
    return html`${this.#activityFormTemplate()}${this.#currentTaskTemplate()}`;
  }

  #activityFormTemplate() {
    return html`
      <form class="activity-form" @submit=${(e) => this.#formSubmitted(e)}>
        <div>
          <label class="caption" for="client">Client</label>
          <input
            type="text"
            required
            disabled="${this.state.isFormDisabled ? '' : nothing}"
            id="client"
            name="client"
            @keyup=${(e) => this.#inputChanged(e)}
          />
        </div>
        <div>
          <label class="caption" for="project">Project</label>
          <input
            type="text"
            required
            disabled="${this.state.isFormDisabled ? '' : nothing}"
            id="project"
            name="project"
            @keyup=${(e) => this.#inputChanged(e)}
          />
        </div>
        <div>
          <label class="caption" for="task">Task</label>
          <input
            type="text"
            required
            disabled="${this.state.isFormDisabled ? '' : nothing}"
            id="task"
            name="task"
            @keyup=${(e) => this.#inputChanged(e)}
          />
        </div>
        <div>
          <label class="caption" for="notes">Notes</label>
          <input
            type="text"
            disabled="${this.state.isFormDisabled ? '' : nothing}"
            id="notes"
            name="notes"
            @keyup=${(e) => this.#inputChanged(e)}
          />
        </div>
        <button
          type="submit"
          disabled="${this.state.isFormDisabled ? '' : nothing}"
        >
          Log
        </button>
      </form>
    `;
  }

  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      actions.activityLogged();
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #inputChanged({ target: { name, value } }) {
    actions.activityUpdated({ name, value });
  }

  #currentTaskTemplate() {
    return html`
      <div class="current-task">
        <span class="caption">${this.state.remainingTime}</span>
        <progress max="1" value="${this.state.progress}"></progress>
        <button
          id="toggle-timer"
          aria-label="Start timer"
          @click=${() => this.#timerToggled()}
        >
          <span class="material-icons">punch_clock</span>
        </button>
      </div>
    `;
  }

  #timerToggled() {
    let button = this.querySelector('#toggle-timer');
    if (this.state.isTimerRunning) {
      actions.stopNotificationsRequested();
      button.setAttribute('aria-label', 'Start timer');
      button.setAttribute('aria-pressed', 'false');
    } else {
      actions.notificationsRequested();
      button.setAttribute('aria-label', 'Stop timer');
      button.setAttribute('aria-pressed', 'true');
    }
  }
}

window.customElements.define('m-current-activity', CurrentActivity);
