import { html } from 'lit-html';

import { Container } from '@activity-sampling/utils/src/browser';

import './time-summary.css';

class TimeSummaryComponent extends Container {
  constructor() {
    super();
    this.classList.add(
      'h-stack',
      'wrapped',
      'justify-center',
      'p-50',
      'gap-25',
    );
  }

  extractState({ recentActivities }) {
    return recentActivities.timeSummary;
  }

  getView() {
    return html`
      <div class="counter">
        <div class="caption">Hours Today</div>
        <div class="duration">
          ${this.state.hoursToday.toString({ style: 'short' })}
        </div>
      </div>
      <div class="counter">
        <div class="caption">Hours Yesterday</div>
        <div class="duration">
          ${this.state.hoursYesterday.toString({ style: 'short' })}
        </div>
      </div>
      <div class="counter">
        <div class="caption">Hours this Week</div>
        <div class="duration">
          ${this.state.hoursThisWeek.toString({ style: 'short' })}
        </div>
      </div>
      <div class="counter">
        <div class="caption">Hours this Month</div>
        <div class="duration">
          ${this.state.hoursThisMonth.toString({ style: 'short' })}
        </div>
      </div>
    `;
  }
}

window.customElements.define('m-time-summary', TimeSummaryComponent);
