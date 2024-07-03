import { html } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { Component } from './components.js';

const ACTIVITY_LOGGED_EVENT = 'activitylogged';

class ActivityLoggedEvent extends Event {
  constructor(activity) {
    super(ACTIVITY_LOGGED_EVENT);
    this.activity = activity;
  }
}

class CurrentActivityComponent extends Component {
  static observedAttributes = ['disabled'];

  #clientRef = createRef();
  #projectRef = createRef();
  #taskRef = createRef();
  #notesRef = createRef();

  #activity = {
    client: '',
    project: '',
    task: '',
    notes: '',
  };

  #disabled = false;

  get activity() {
    return this.#activity;
  }

  set activity(activity) {
    if (this.#activity === activity) {
      return;
    }

    this.#activity = { ...activity, timestamp: undefined };
    this.updateView();
  }

  get disabled() {
    return this.#disabled;
  }

  set disabled(disabled) {
    if (this.#disabled === disabled) {
      return;
    }
    this.#disabled = disabled;
    this.updateView();
  }

  updateView() {
    super.updateView();
    if (this.isConnected) {
      this.#clientRef.value = this.#activity.client;
      this.#projectRef.value = this.#activity.project;
      this.#taskRef.value = this.#activity.task;
      this.#notesRef.value = this.#activity.notes;
    }
  }

  extractState(state) {
    return {
      activity: state.currentActivity.activity,
      isFormDisabled: state.currentActivity.isFormDisabled,
    };
  }

  getView() {
    return html`
      <form class="v-stack gap-y-50" @submit=${(e) => this.#formSubmitted(e)}>
        ${this.#textInputTemplate(this.#clientRef, 'client', 'Client', true)}
        ${this.#textInputTemplate(this.#projectRef, 'project', 'Project', true)}
        ${this.#textInputTemplate(this.#taskRef, 'task', 'Task', true)}
        ${this.#textInputTemplate(this.#notesRef, 'notes', 'Notes')}
        <button type="submit" class="mt-75" ?disabled="${this.disabled}">
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
          ?required="${required}"
          ?disabled="${this.disabled}"
          id="${name}"
          name="${name}"
          @keyup=${(e) => this.#inputChanged(e)}
        />
      </div>
    `;
  }

  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.dispatchEvent(new ActivityLoggedEvent(this.#activity));
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #inputChanged({ target: { name, value } }) {
    this[`#${name}`] = value;
  }
}

window.customElements.define('m-current-activity', CurrentActivityComponent);
