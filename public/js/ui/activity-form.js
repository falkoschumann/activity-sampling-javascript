import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

class ActivityForm extends Component {
  disconnectedCallback() {
    super.disconnectedCallback();
    actions.stopTimer();
  }

  updateView() {
    super.updateView();
    this.querySelector('#client').value = this.state.client;
    this.querySelector('#project').value = this.state.project;
    this.querySelector('#task').value = this.state.task;
    this.querySelector('#notes').value = this.state.notes;
  }

  extractState(state) {
    return state.activityForm;
  }

  getView() {
    return html`
      <form @submit=${(e) => this.#onSubmit(e)}>
        <div>
          <label class="caption" for="client">Client</label>
          <input
            type="text"
            required
            id="client"
            name="client"
            @keyup=${(e) => this.#onInput(e)}
          />
        </div>
        <div>
          <label class="caption" for="project">Project</label>
          <input
            type="text"
            required
            id="project"
            name="project"
            @keyup=${(e) => this.#onInput(e)}
          />
        </div>
        <div>
          <label class="caption" for="task">Task</label>
          <input
            type="text"
            required
            id="task"
            name="task"
            @keyup=${(e) => this.#onInput(e)}
          />
        </div>
        <div>
          <label class="caption" for="notes">Notes</label>
          <input
            type="text"
            required
            id="notes"
            name="notes"
            @keyup=${(e) => this.#onInput(e)}
          />
        </div>
        <button type="submit">Log</button>
      </form>
      <m-current-task>
        <span class="caption">${this.state.remainingTime}</span>
        <progress max="1" value="${this.state.progress}"></progress>
        <button
          id="toggle-timer"
          aria-label="Start timer"
          @click=${this.#handleToggleTimer}
        >
          <span class="material-icons">punch_clock</span>
        </button>
      </m-current-task>
    `;
  }

  #onInput({ target: { name, value } }) {
    actions.activityUpdated({ name, value });
  }

  #onSubmit(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#logActivity(event.target);
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #logActivity(form) {
    let formData = new FormData(form);
    let command = {
      client: formData.get('client'),
      project: formData.get('project'),
      task: formData.get('task'),
      notes: formData.get('notes'),
    };
    actions.logActivity(command);
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

window.customElements.define('m-activity-form', ActivityForm);
