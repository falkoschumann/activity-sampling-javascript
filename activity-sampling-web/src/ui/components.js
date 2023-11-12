import { html } from 'lit-html';

import './components.css';
import { Component } from './actions.js';
import * as actions from './actions.js';

class ActivitySampling extends Component {
  async connectedCallback() {
    super.connectedCallback();
    actions.getRecentActivities();
  }

  getView() {
    return html`
      <h1>Activity Sampling</h1>
      <m-activity-form></m-activity-form>
      <m-current-task></m-current-task>
      <m-recent-activities></m-recent-activities>
    `;
  }
}

window.customElements.define('m-activity-sampling', ActivitySampling);

class ActivityForm extends Component {
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
      <form @submit="${(e) => this.#onSubmit(e)}">
        <div>
          <label class="caption" for="client">Client</label>
          <input
            type="text"
            required
            id="client"
            name="client"
            @keyup="${(e) => this.#onInput(e)}"
          />
        </div>
        <div>
          <label class="caption" for="project">Project</label>
          <input
            type="text"
            required
            id="project"
            name="project"
            @keyup="${(e) => this.#onInput(e)}"
          />
        </div>
        <div>
          <label class="caption" for="task">Task</label>
          <input
            type="text"
            required
            id="task"
            name="task"
            @keyup="${(e) => this.#onInput(e)}"
          />
        </div>
        <div>
          <label class="caption" for="notes">Notes</label>
          <input
            type="text"
            required
            id="notes"
            name="notes"
            @keyup="${(e) => this.#onInput(e)}"
          />
        </div>
        <button type="submit">Log</button>
      </form>
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
}

window.customElements.define('m-activity-form', ActivityForm);

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
        >
          <path
            d="M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h40v-200h480v200h40q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm120-640h320v-120H320v120ZM200-160h560v-480H200v480Zm280-40q83 0 141.5-58.5T680-400q0-83-58.5-141.5T480-600q-83 0-141.5 58.5T280-400q0 83 58.5 141.5T480-200Zm0-60q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm46-66 28-28-54-54v-92h-40v108l66 66Zm-46-74Z"
          />
        </svg>
      </button>
    `;
  }
}

window.customElements.define('m-current-task', CurrentTask);

class RecentActivities extends Component {
  async connectedCallback() {
    super.connectedCallback();
    actions.getRecentActivities();
  }

  getView() {
    return html`
      <m-working-days></m-working-days>
      <m-time-summary></m-time-summary>
    `;
  }
}

window.customElements.define('m-recent-activities', RecentActivities);

class WorkingDays extends Component {
  extractState(state) {
    return state.recentActivities.workingDays;
  }

  getView() {
    return html`
      ${this.state.map(({ date, activities }) =>
        this.#renderWorkingDay({ date, activities }),
      )}
    `;
  }

  #renderWorkingDay({ date, activities }) {
    return html`
      <section>
        <h4>${date.toLocaleDateString(undefined, { dateStyle: 'full' })}</h4>
        <ul>
          ${activities.map((activity) => this.#renderActivity(activity))}
        </ul>
      </section>
    `;
  }

  #renderActivity({ timestamp, client, project, task, notes }) {
    return html`
      <li @click="${() => this.#onClick({ client, project, task, notes })}">
        <div>
          <strong
            >${timestamp.toLocaleTimeString(undefined, {
              timeStyle: 'short',
            })}</strong
          >
        </div>
        <div>
          <div>${project} (${client}) ${task}</div>
          <div class="caption">${notes}</div>
        </div>
      </li>
    `;
  }

  #onClick({ client, project, task, notes }) {
    actions.setActivity({ client, project, task, notes });
  }
}

window.customElements.define('m-working-days', WorkingDays);

class TimeSummary extends Component {
  extractState(state) {
    return state.recentActivities.timeSummary;
  }

  getView() {
    return html`
      <div>
        <div class="caption">Hours Today</div>
        <div>${this.state.hoursToday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours Yesterday</div>
        <div>${this.state.hoursYesterday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Week</div>
        <div>${this.state.hoursThisWeek.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Month</div>
        <div>${this.state.hoursThisMonth.toString({ style: 'short' })}</div>
      </div>
    `;
  }
}

window.customElements.define('m-time-summary', TimeSummary);
