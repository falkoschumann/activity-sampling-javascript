import { html } from 'lit-html';

import { Component, Container } from '@activity-sampling/browser-utils';

import { Services } from '../application/services.js';
import { store } from '../application/store.js';
import './style/fonts/all.css';
import './style/reset.css';
import './style/fragments.css';
import './style/components.css';
import './style/modules.css';
import './activity-sampling.css';
import './current-activity.js';
import './countdown.js';
import './main-menu.js';
import './recent-activities.js';
import './time-summary.js';

class ActivitySamplingComponent extends Component {
  constructor() {
    super();
    this.classList.add('screen-height', 'v-stack', 'gap-50');
    Container.initStore(store);
  }

  connectedCallback() {
    super.connectedCallback();
    Services.get().selectRecentActivities();
  }

  getView() {
    return html`
      <header>
        <m-main-menu></m-main-menu>
      </header>
      <aside class="p-50 space-y-100">
        <m-current-activity></m-current-activity>
        <m-countdown></m-countdown>
      </aside>
      <main class="p-50 expanded">
        <m-recent-activities></m-recent-activities>
      </main>
      <footer>
        <m-time-summary></m-time-summary>
      </footer>
    `;
  }
}

window.customElements.define('m-activity-sampling', ActivitySamplingComponent);
