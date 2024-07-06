import { html } from 'lit-html';

import { Component, Container } from '@activity-sampling/utils/src/browser.js';

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

class ActivitySamplingComponent extends Component {
  constructor() {
    super();
    Container.initStore(Services.get().store);
  }

  connectedCallback() {
    super.connectedCallback();
    Services.get().selectRecentActivities();
  }

  getView() {
    return html`
      <aside class="space-y-100">
        <m-current-activity></m-current-activity>
        <m-countdown></m-countdown>
      </aside>
      <main>
        <m-recent-activities></m-recent-activities>
      </main>
      <footer>
        <m-time-summary></m-time-summary>
      </footer>
    `;
  }
}

window.customElements.define('m-activity-sampling', ActivitySamplingComponent);
