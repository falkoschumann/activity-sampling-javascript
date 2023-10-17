import { html } from 'lit-html';

import './components.css';
import {
  activityUpdatedAction,
  Component,
  getRecentActivitiesAction,
  logActivityAction,
  setActivityAction,
} from './actions.js';

class ActivitySampling extends Component {
  async connectedCallback() {
    super.connectedCallback();
    getRecentActivitiesAction();
  }

  getView() {
    return html`
      <h1>Activity Sampling</h1>
      <m-activity-form></m-activity-form>
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
    return state.activity;
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
    activityUpdatedAction({ name, value });
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
    logActivityAction(command);
  }
}

window.customElements.define('m-activity-form', ActivityForm);

class RecentActivities extends Component {
  async connectedCallback() {
    super.connectedCallback();
    getRecentActivitiesAction();
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
    setActivityAction({ client, project, task, notes });
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
        <div>${formatHours(this.state.hoursToday)}</div>
      </div>
      <div>
        <div class="caption">Hours Yesterday</div>
        <div>${formatHours(this.state.hoursYesterday)}</div>
      </div>
      <div>
        <div class="caption">Hours this Week</div>
        <div>${formatHours(this.state.hoursThisWeek)}</div>
      </div>
      <div>
        <div class="caption">Hours this Month</div>
        <div>${formatHours(this.state.hoursThisMonth)}</div>
      </div>
    `;
  }
}

window.customElements.define('m-time-summary', TimeSummary);

function formatHours(hours) {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
