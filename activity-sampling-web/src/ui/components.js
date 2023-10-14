import { html } from 'lit-html';

import './components.css';
import { Component, getRecentActivitiesAction } from './actions.js';

class RecentActivities extends Component {
  async connectedCallback() {
    super.connectedCallback();
    getRecentActivitiesAction();
  }

  extractState(state) {
    return state.recentActivities;
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
      <li>
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
}

window.customElements.define('m-working-days', WorkingDays);

class TimeSummary extends Component {
  extractState(state) {
    return state.recentActivities.timeSummary;
  }

  getView() {
    return html`
      <div>
        <span class="caption">Hours Today</span>
        <span>${formatHours(this.state.hoursToday)}</span>
      </div>
      <div>
        <span class="caption">Hours Yesterday</span>
        <span>${formatHours(this.state.hoursYesterday)}</span>
      </div>
      <div>
        <span class="caption">Hours this Week</span>
        <span>${formatHours(this.state.hoursThisWeek)}</span>
      </div>
      <div>
        <span class="caption">Hours this Month</span>
        <span>${formatHours(this.state.hoursThisMonth)}</span>
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
