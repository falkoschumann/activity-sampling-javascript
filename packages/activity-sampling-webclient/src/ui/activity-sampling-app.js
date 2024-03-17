import { html } from 'lit-html';

import './reset.css';
import './fragments.css';
import './components.css';
import './modules.css';
import './activity-sampling-app.css';
import './current-activity.js';
import './recent-activities.js';
import './time-summary.js';
import * as actions from './actions.js';
import { StateComponent } from './state-component.js';

// TODO integrate main.js with this file

class ActivitySamplingAppComponent extends StateComponent {
  connectedCallback() {
    super.connectedCallback();
    actions.refreshRequested();
  }

  extractState(state) {
    return state.recentActivities;
  }

  getView() {
    return html`
      <header>
        <h1>Activity Sampling</h1>
      </header>
      <aside>
        <m-current-activity></m-current-activity>
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
