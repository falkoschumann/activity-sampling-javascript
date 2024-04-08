import { html } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';

import * as services from '../application/services.js';
import './reset.css';
import './fragments.css';
import './components.css';
import './modules.css';
import './activity-sampling-app.css';
import './current-activity.js';
import './countdown.js';
import './recent-activities.js';
import './time-summary.js';
import store from './store.js';
import { StateComponent } from './state-component.js';

// FIXME replace stub with real gateway
const activitiesGateway = {};

class ActivitySamplingAppComponent extends StateComponent {
  #currentActivityRef = createRef();

  connectedCallback() {
    super.connectedCallback();
    this.#refreshRequested();
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
          ${ref(this.#currentActivityRef)}
          .activity=${this.state.activity}
          .isDisabled=${this.state.isFormDisabled}
          @activity-logged=${this.#activityLogged.bind(this)}
        ></m-current-activity>
        <m-countdown .value=${this.state.countdown}></m-countdown>
      </aside>
      <main>
        <m-recent-activities
          .workingDays=${this.state.workingDays}
          @activity-selected=${this.#activitySelected.bind(this)}
        ></m-recent-activities>
      </main>
      <footer>
        <m-time-summary .hours=${this.state.timeSummary}></m-time-summary>
      </footer>
    `;
  }

  #refreshRequested() {
    services.selectRecentActivities(store, activitiesGateway);
  }

  #activityLogged(activity) {
    services.activityLogged(activity, store, activitiesGateway);
  }

  #activitySelected(activity) {
    this.#currentActivityRef.value.activity = activity;
  }
}

window.customElements.define(
  'm-activity-sampling-app',
  ActivitySamplingAppComponent,
);
