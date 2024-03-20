import { html } from 'lit-html';

import * as actions from './actions.js';
import { StateComponent } from './state-component.js';

class CurrentActivityComponent extends StateComponent {
  disconnectedCallback() {
    super.disconnectedCallback();
    actions.stopNotificationsRequested();
  }

  updateView() {
    super.updateView();
    this.querySelector('#client').value = this.state.activity.client;
    this.querySelector('#project').value = this.state.activity.project;
    this.querySelector('#task').value = this.state.activity.task;
    this.querySelector('#notes').value = this.state.activity.notes;
  }

  extractState(state) {
    return {
      activity: state.currentActivity.activity,
      isFormDisabled: state.currentActivity.isFormDisabled,
    };
  }

  getView() {
    // TODO activity
    // TODO isFormDisabled
    return html`
      <form class="activity-form" @submit=${(e) => this.#formSubmitted(e)}>
        ${this.#textInputTemplate('client', 'Client', true)}
        ${this.#textInputTemplate('project', 'Project', true)}
        ${this.#textInputTemplate('task', 'Task', true)}
        ${this.#textInputTemplate('notes', 'Notes')}
        <button type="submit" ?disabled="${this.state.isFormDisabled}">
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
          ?required="${required}"
          ?disabled="${this.state.isFormDisabled}"
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
}

window.customElements.define('m-current-activity', CurrentActivityComponent);
