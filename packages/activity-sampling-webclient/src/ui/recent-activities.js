import { html } from 'lit-html';

import './time-summary.js';
import * as actions from './actions.js';
import { StateComponent } from './state-component.js';

class RecentActivitiesComponent extends StateComponent {
  connectedCallback() {
    super.connectedCallback();
    actions.refreshRequested();
  }

  extractState(state) {
    return state.recentActivities;
  }

  getView() {
    return html`
      ${this.workingDaysTemplate()}
      <m-time-summary .hours=${this.state.timeSummary}></m-time-summary>
    `;
  }

  workingDaysTemplate() {
    return html`
      <div class="working-days">
        ${this.state.workingDays.map(({ date, activities }) =>
          this.#workingDayTemplate({ date, activities }),
        )}
      </div>
    `;
  }

  #workingDayTemplate({ date, activities }) {
    return html`
      <section>
        <h4>${date.toLocaleDateString(undefined, { dateStyle: 'full' })}</h4>
        <ul>
          ${activities.map((activity) => this.#activityTemplate(activity))}
        </ul>
      </section>
    `;
  }

  #activityTemplate({ timestamp, client, project, task, notes }) {
    return html`
      <li
        @dblclick=${() =>
          this.#activitySelected({ client, project, task, notes })}
      >
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

  #activitySelected({ client, project, task, notes }) {
    actions.activitySelected({ client, project, task, notes });
  }
}

window.customElements.define('m-recent-activities', RecentActivitiesComponent);
