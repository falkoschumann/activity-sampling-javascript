import { html } from 'lit-html';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { Container } from '@activity-sampling/utils/src/browser.js';

import './reset.css';
import './fragments.css';
import './components.css';
import './modules.css';
import './activity-sampling.css';
import './current-activity.js';
import './countdown.js';
import './recent-activities.js';
import './time-summary.js';
import { Services } from '../application/services.js';

class ActivitySamplingComponent extends Container {
  #currentActivityRef = createRef();
  #services = Services.getDefault();

  constructor() {
    super();
    Container.initStore(this.#services.store);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#refreshRequested();
  }

  getView() {
    return html`
      <aside class="space-y-100">
        <m-current-activity
          ${ref(this.#currentActivityRef)}
          .activity=${this.state.currentActivity}
          .disabled=${this.state.isFormDisabled}
          @activitylogged=${this.#activityLogged.bind(this)}
        ></m-current-activity>
        <m-countdown .value=${this.state.countdown}></m-countdown>
      </aside>
      <main>
        <m-recent-activities
          .workingDays=${this.state.recentActivities.workingDays}
          @activityselected=${this.#activitySelected.bind(this)}
        ></m-recent-activities>
      </main>
      <footer>
        <m-time-summary
          .hours=${this.state.recentActivities.timeSummary}
        ></m-time-summary>
      </footer>
    `;
  }

  #refreshRequested() {
    this.#services.selectRecentActivities();
  }

  #activityLogged(event) {
    this.#services.activityLogged(event.activity);
  }

  #activitySelected(activity) {
    // FIXME this has no effect
    this.#currentActivityRef.value.activity = activity;
  }
}

window.customElements.define('m-activity-sampling', ActivitySamplingComponent);
