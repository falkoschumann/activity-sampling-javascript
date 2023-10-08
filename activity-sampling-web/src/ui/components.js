import { html, render } from 'lit-html';
import { getRecentActivities } from '../application/services.js';

import { FakeRepository } from '../infrastructure/repository.js';

let repository = new FakeRepository([
  {
    timestamp: new Date('2023-10-07T13:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:30:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
]);

class RecentActivities extends HTMLElement {
  async connectedCallback() {
    let recentActivities = await getRecentActivities(repository);
    let template = html`
      <section class="recent-activities">
        ${recentActivities.workingDays.map(({ date, activities }) =>
          this.#renderActivities({
            date,
            activities,
          }),
        )}
      </section>
    `;
    render(template, this);
  }

  #renderActivities({ date, activities }) {
    return html`
      <h4>${date.toLocaleDateString(undefined, { dateStyle: 'full' })}</h4>
      <ul>
        ${activities.map((activity) => this.#renderActivity(activity))}
      </ul>
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

window.customElements.define('m-recent-activities', RecentActivities);
