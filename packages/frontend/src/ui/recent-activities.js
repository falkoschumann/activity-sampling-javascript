import { html } from 'lit-html';

import { Container } from '@activity-sampling/browser-utils';

import './recent-activities.css';
import { Services } from '../application/services.js';

class RecentActivitiesComponent extends Container {
  extractState({ recentActivities }) {
    return recentActivities.workingDays;
  }

  getView() {
    return html`
      ${this.state.map(({ date, activities }) =>
        this.#workingDayTemplate({ date, activities }),
      )}
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
        class="h-stack p-50"
        @dblclick=${() =>
          Services.get().activityUpdated({ client, project, task, notes })}
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
}

window.customElements.define('m-recent-activities', RecentActivitiesComponent);
