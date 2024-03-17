import { html, nothing } from 'lit-html';

import * as actions from './actions.js';
import { StateComponent } from './state-component.js';

class CurrentActivityComponent extends StateComponent {
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
        ${this.#textInputTemplate('client', 'Client', true)}
        ${this.#textInputTemplate('project', 'Project', true)}
        ${this.#textInputTemplate('task', 'Task', true)}
        ${this.#textInputTemplate('notes', 'Notes')}
        <button
          type="submit"
          disabled="${this.state.isFormDisabled ? '' : nothing}"
        >
          Log
        </button>
      </form>
    `;
  }

  #textInputTemplate(id, title, required = false) {
    return html`
      <div>
        <label class="caption" for="${id}">${title}</label>
        <input
          type="text"
          required="${required ? '' : nothing}"
          disabled="${this.state.isFormDisabled ? '' : nothing}"
          id="${id}"
          name="${id}"
          @keyup=${(e) => this.#inputChanged(e)}
        />
      </div>
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
    // TODO parametrize the period on start
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
      <select name="period" value="30">
        <optgroup label="Period">
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="20">20 minutes</option>
          <option value="30" selected>30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="1">1 minute</option>
        </optgroup>
      </select>
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

window.customElements.define('m-current-activity', CurrentActivityComponent);
