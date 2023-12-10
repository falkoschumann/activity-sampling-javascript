import { html } from '../../vendor/lit-html.js';

import { Component } from './component.js';

class TimeSummary extends Component {
  extractState(state) {
    return state.recentActivities.timeSummary;
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

window.customElements.define('m-time-summary', TimeSummary);
