import { html } from 'lit-html';

import { Duration } from '@activity-sampling/utils';
import { Component } from '@activity-sampling/utils/src/browser.js';

import './time-summary.css';

class TimeSummaryComponent extends Component {
  #hours = {
    hoursToday: Duration.zero(),
    hoursYesterday: Duration.zero(),
    hoursThisWeek: Duration.zero(),
    hoursThisMonth: Duration.zero(),
  };

  get hours() {
    return this.#hours;
  }

  set hours(hours) {
    if (this.#hours === hours) {
      return;
    }

    this.#hours = hours;
    this.updateView();
  }

  getView() {
    return html`
      <div>
        <div class="caption">Hours Today</div>
        <div>${this.#hours.hoursToday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours Yesterday</div>
        <div>${this.#hours.hoursYesterday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Week</div>
        <div>${this.#hours.hoursThisWeek.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Month</div>
        <div>${this.#hours.hoursThisMonth.toString({ style: 'short' })}</div>
      </div>
    `;
  }
}

window.customElements.define('m-time-summary', TimeSummaryComponent);
