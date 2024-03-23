import { html } from 'lit-html';

import './reset.css';
import './fragments.css';
import './components.css';
import './modules.css';
import './activity-sampling-app.css';
import './current-activity.js';
import './countdown.js';
import './recent-activities.js';
import './time-summary.js';
import * as actions from './actions.js';
import { StateComponent } from './state-component.js';

// TODO create demo with local storage

class ActivitySamplingAppComponent extends StateComponent {
  connectedCallback() {
    super.connectedCallback();
    actions.refreshRequested();
  }

  extractState(state) {
    return {
      activity: state.currentActivity.activity,
      isFormDisabled: state.currentActivity.isFormDisabled,
      countdown: state.currentActivity.countdown,
      workingDays: state.recentActivities.workingDays,
      timeSummary: state.recentActivities.timeSummary,
    };
  }

  getView() {
    return html`
      <aside class="space-y-100">
        <m-current-activity
          .activity=${this.state.activity}
          .isDisabled=${this.state.isFormDisabled}
          @activity-logged=${actions.activityLogged}
        ></m-current-activity>
        <m-countdown .value=${this.state.countdown}></m-countdown>
      </aside>
      <main>
        <m-recent-activities
          .workingDays=${this.state.workingDays}
          @activity-selected=${actions.activitySelected}
        ></m-recent-activities>
      </main>
      <footer>
        <m-time-summary .hours=${this.state.timeSummary}></m-time-summary>
      </footer>
    `;
  }
}

window.customElements.define(
  'm-activity-sampling-app',
  ActivitySamplingAppComponent,
);
