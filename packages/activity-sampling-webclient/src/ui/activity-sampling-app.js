import { html } from 'lit-html';

import './reset.css';
import './fragments.css';
import './components.css';
import './modules.css';
import './current-activity.js';
import './recent-activities.js';
import { Component } from './component.js';

class ActivitySamplingAppComponent extends Component {
  getView() {
    return html`
      <h1>Activity Sampling</h1>
      <m-current-activity></m-current-activity>
      <m-recent-activities></m-recent-activities>
    `;
  }
}

window.customElements.define(
  'm-activity-sampling-app',
  ActivitySamplingAppComponent,
);
