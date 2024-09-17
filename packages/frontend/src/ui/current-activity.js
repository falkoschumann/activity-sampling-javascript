import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { Container } from '@muspellheim/utils/src/browser';

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
      <form class="v-stack gap-50" @submit=${(e) => this.#formSubmitted(e)}>
        <ul class="form">
          ${this.#textInputTemplate(this.#clientRef, 'client', 'Client', true)}
          ${this.#textInputTemplate(
            this.#projectRef,
            'project',
            'Project',
            true,
          )}
          ${this.#textInputTemplate(this.#taskRef, 'task', 'Task', true)}
          ${this.#textInputTemplate(this.#notesRef, 'notes', 'Notes')}
          <li>
            <button
              type="submit"
              class="mt-75"
              ?disabled="${this.state.isSubmitDisabled}"
            >
              Log
            </button>
          </li>
        </ul>
      </form>
    `;
  }

  #textInputTemplate(inputRef, name, title, required = false) {
    return html`
      <li class=${classMap({ required: required })}>
        <label for="${name}">${title}</label>
        <input
          ${ref(inputRef)}
          type="text"
          ?disabled="${this.state.isFormDisabled}"
          id="${name}"
          name="${name}"
          @keyup=${(e) => this.#inputChanged(e)}
        />
      </li>
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
