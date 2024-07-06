import { html } from 'lit-html';

import { Container } from '@activity-sampling/utils/src/browser.js';

import './time-summary.css';

class TimeSummaryComponent extends Container {
  extractState({ recentActivities }) {
    return recentActivities.timeSummary;
  }

  getView() {
    return html`
      <div>
        <div class="caption">Hours Today</div>
        <div>${this.state.hoursToday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours Yesterday</div>
        <div>${this.state.hoursYesterday.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Week</div>
        <div>${this.state.hoursThisWeek.toString({ style: 'short' })}</div>
      </div>
      <div>
        <div class="caption">Hours this Month</div>
        <div>${this.state.hoursThisMonth.toString({ style: 'short' })}</div>
      </div>
    `;
  }
}

window.customElements.define('m-time-summary', TimeSummaryComponent);
