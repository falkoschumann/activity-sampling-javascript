import { html } from 'lit-html';

import './current-activity.js';
import './recent-activities.js';
import { Component } from './component.js';

class ActivitySamplingApp extends Component {
  connectedCallback() {
    super.connectedCallback();
  }

  getView() {
    return html`
      <h1>Activity Sampling</h1>
      <m-current-activity></m-current-activity>
      <m-recent-activities></m-recent-activities>
    `;
  }
}

window.customElements.define('m-activity-sampling-app', ActivitySamplingApp);
