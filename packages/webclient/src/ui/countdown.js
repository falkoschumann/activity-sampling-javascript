import { html } from 'lit-html';

import { Container } from '@activity-sampling/utils/src/browser.js';

export class CountdownComponent extends Container {
  constructor() {
    super();
    this.classList.add('h-stack', 'items-center', 'gap-50');
  }

  extractState({ countdown }) {
    return countdown;
  }

  getView() {
    const progress = 1 - this.state.remainingTime / this.state.period;
    return html`
      <div class="expanded v-stack items-center gap-50">
        <span class="caption">${this.state.remainingTime}</span>
        <progress class="full-width" max="1" value=${progress}></progress>
      </div>
    `;
  }
}

window.customElements.define('m-countdown', CountdownComponent);
