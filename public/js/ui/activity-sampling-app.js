import { html, render } from '../../vendor/lit-html.js';

import './activity-form.js';
import './current-task.js';
import './recent-activities.js';
import * as actions from './actions.js';

class ActivitySamplingApp extends HTMLElement {
  connectedCallback() {
    let view = html`
      <h1>Activity Sampling</h1>
      <m-activity-form></m-activity-form>
      <m-current-task></m-current-task>
      <m-recent-activities></m-recent-activities>
    `;
    render(view, this);
    actions.getRecentActivities();
  }
}

window.customElements.define('m-activity-sampling-app', ActivitySamplingApp);
