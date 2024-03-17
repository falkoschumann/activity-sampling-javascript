import { html } from 'lit-html';

import './recent-activities.css';
import { Component } from './component.js';

export class ActivitySelectedEvent extends Event {
  static type = 'activity-selected';

  constructor({ client, project, task, notes }) {
    super(ActivitySelectedEvent.type, { bubbles: true, composed: true });
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

class RecentActivitiesComponent extends Component {
  #workingDays = [];

  get workingDays() {
    return this.#workingDays;
  }

  set workingDays(workingDays) {
    if (this.#workingDays === workingDays) {
      return;
    }

    this.#workingDays = workingDays;
    this.updateView();
  }

  getView() {
    return html`
      ${this.workingDays.map(({ date, activities }) =>
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
        @dblclick=${() =>
          this.dispatchEvent(
            new ActivitySelectedEvent({ client, project, task, notes }),
          )}
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
