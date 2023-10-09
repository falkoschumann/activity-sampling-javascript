import { html, render } from 'lit-html';

import { getRecentActivities } from './actions.js';

class RecentActivities extends HTMLElement {
  async connectedCallback() {
    let recentActivities = await getRecentActivities();
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
