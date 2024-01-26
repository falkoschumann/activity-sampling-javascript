import { html, render } from 'lit-html';

import './current-activity.js';
import './recent-activities.js';
import { serviceLocator } from './actions.js';
import { Api } from '../infrastructure/api.js';

class ActivitySamplingApp extends HTMLElement {
  connectedCallback() {
    serviceLocator.register('api', Api.createNull());

    let view = html`
      <h1>Activity Sampling</h1>
      <m-current-activity></m-current-activity>
      <m-recent-activities></m-recent-activities>
    `;
    render(view, this);
  }
}

window.customElements.define('m-activity-sampling-app', ActivitySamplingApp);
