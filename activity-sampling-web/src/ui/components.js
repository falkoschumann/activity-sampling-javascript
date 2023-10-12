import { html, render } from 'lit-html';

import './components.css';
import { getRecentActivitiesAction } from './actions.js';

class RecentActivities extends HTMLElement {
  async connectedCallback() {
    let recentActivities = await getRecentActivitiesAction();
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

class TimeSummary extends HTMLElement {
  async connectedCallback() {
    let { timeSummary } = await getRecentActivitiesAction();
    let template = html`
      <div>
        <span class="caption">Hours Today</span>
        <span>${formatHours(timeSummary.hoursToday)}</span>
      </div>
      <div>
        <span class="caption">Hours Yesterday</span>
        <span>${formatHours(timeSummary.hoursYesterday)}</span>
      </div>
      <div>
        <span class="caption">Hours this Week</span>
        <span>${formatHours(timeSummary.hoursThisWeek)}</span>
      </div>
      <div>
        <span class="caption">Hours this Month</span>
        <span>${formatHours(timeSummary.hoursThisMonth)}</span>
      </div>
    `;
    render(template, this);
  }
}

function formatHours(hours) {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, 0)}:${m.toString().padStart(2, 0)}`;
}

window.customElements.define('m-time-summary', TimeSummary);
