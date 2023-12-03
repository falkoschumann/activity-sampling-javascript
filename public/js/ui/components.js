import { html } from '../../vendor/lit-html.js';

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
        <span class="material-icons">punch_clock</span>
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
