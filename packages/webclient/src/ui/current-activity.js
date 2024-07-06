import { html } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { Container } from '@activity-sampling/utils/src/browser.js';
import { Services } from '../application/services.js';

class CurrentActivityComponent extends Container {
  #clientRef = createRef();
  #projectRef = createRef();
  #taskRef = createRef();
  #notesRef = createRef();

  extractState({ currentActivity }) {
    return currentActivity;
  }

  updateView() {
    super.updateView();
    const { client, project, task, notes } = this.state.activity;
    this.#clientRef.value.value = client;
    this.#projectRef.value.value = project;
    this.#taskRef.value.value = task;
    this.#notesRef.value.value = notes;
  }

  getView() {
    return html`
      <form class="v-stack gap-y-50" @submit=${(e) => this.#formSubmitted(e)}>
        ${this.#textInputTemplate(this.#clientRef, 'client', 'Client', true)}
        ${this.#textInputTemplate(this.#projectRef, 'project', 'Project', true)}
        ${this.#textInputTemplate(this.#taskRef, 'task', 'Task', true)}
        ${this.#textInputTemplate(this.#notesRef, 'notes', 'Notes')}
        <button
          type="submit"
          class="mt-75"
          ?disabled="${this.state.isSubmitDisabled}"
        >
          Log
        </button>
      </form>
    `;
  }

  #textInputTemplate(inputRef, name, title, required = false) {
    return html`
      <div class="v-stack">
        <label for="${name}">${title}${required ? '*' : ''}</label>
        <input
          ${ref(inputRef)}
          type="text"
          ?disabled="${this.state.isFormDisabled}"
          id="${name}"
          name="${name}"
          @keyup=${(e) => this.#inputChanged(e)}
        />
      </div>
    `;
  }

  async #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      await Services.get().logActivity();
      await Services.get().selectRecentActivities();
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  async #inputChanged({ target: { name, value } }) {
    await Services.get().activityUpdated({ [name]: value });
  }
}

window.customElements.define('m-current-activity', CurrentActivityComponent);
