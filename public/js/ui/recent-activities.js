import { html, render } from '../../vendor/lit-html.js';

import './working-days.js';
import './time-summary.js';
import * as actions from './actions.js';

class RecentActivities extends HTMLElement {
  connectedCallback() {
    let view = html`
      <m-working-days></m-working-days>
      <m-time-summary></m-time-summary>
    `;
    render(view, this);
    actions.getRecentActivities();
  }
}

window.customElements.define('m-recent-activities', RecentActivities);
