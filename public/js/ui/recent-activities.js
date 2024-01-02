import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';
import * as actions from './actions.js';

class RecentActivities extends Component {
  connectedCallback() {
    super.connectedCallback();
    actions.getRecentActivities();
  }

  getView() {
    return html` ${this.#getWorkingDaysView()} ${this.#getTimeSummaryView()} `;
  }

  #getWorkingDaysView() {
    return html`
      <div class="working-days">
        ${this.state.workingDays.map(({ date, activities }) =>
          this.#getWorkingDayView({ date, activities }),
        )}
      </div>
    `;
  }

  #getWorkingDayView({ date, activities }) {
    return html`
      <section>
        <h4>${date.toLocaleDateString(undefined, { dateStyle: 'full' })}</h4>
        <ul>
          ${activities.map((activity) => this.#getActivityView(activity))}
        </ul>
      </section>
    `;
  }

  #getActivityView({ timestamp, client, project, task, notes }) {
    return html`
      <li @click=${() => this.#onClick({ client, project, task, notes })}>
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

  #getTimeSummaryView() {
    return html`
      <div class="time-summary">
        <div>
          <div class="caption">Hours Today</div>
          <div>
            ${this.state.timeSummary.hoursToday.toString({ style: 'short' })}
          </div>
        </div>
        <div>
          <div class="caption">Hours Yesterday</div>
          <div>
            ${this.state.timeSummary.hoursYesterday.toString({
              style: 'short',
            })}
          </div>
        </div>
        <div>
          <div class="caption">Hours this Week</div>
          <div>
            ${this.state.timeSummary.hoursThisWeek.toString({ style: 'short' })}
          </div>
        </div>
        <div>
          <div class="caption">Hours this Month</div>
          <div>
            ${this.state.timeSummary.hoursThisMonth.toString({
              style: 'short',
            })}
          </div>
        </div>
      </div>
    `;
  }

  #onClick({ client, project, task, notes }) {
    actions.setActivity({ client, project, task, notes });
  }

  extractState(state) {
    return state.recentActivities;
  }
}

window.customElements.define('m-recent-activities', RecentActivities);
