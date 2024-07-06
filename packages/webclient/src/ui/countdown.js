import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { createRef, ref } from 'lit-html/directives/ref.js';

import { Duration } from '@activity-sampling/utils';
import { Container } from '@activity-sampling/utils/src/browser.js';

import './countdown.css';
import { Services } from '../application/services.js';

export class CountdownComponent extends Container {
  #periodRef = createRef();

  extractState({ countdown }) {
    return countdown;
  }

  getView() {
    const progress = 1 - this.state.remainingTime / this.state.period;
    const title = this.state.isRunning ? 'Stop countdown' : 'Start countdown';
    return html`
      <div class="progress">
        <span>${this.state.remainingTime}</span>
        <progress max="1" value=${progress}></progress>
      </div>
      <button
        class="icon-only switch ${classMap({ on: this.state.isRunning })}"
        title=${title}
        aria-label=${title}
        @click=${() => this.#toggle()}
      >
        <span class="material-icons">punch_clock</span>
      </button>
      <div class="select-wrapper icon-only">
        <select
          ${ref(this.#periodRef)}
          name="period"
          value="30"
          title="Set period"
        >
          <optgroup label="Period">
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30" selected>30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="1">1 minute</option>
          </optgroup>
        </select>
      </div>
    `;
  }

  async #toggle() {
    if (this.state.isRunning) {
      await Services.get().stopAskingPeriodically();
    } else {
      const period = new Duration(`PT${this.#periodRef.value.value}M`);
      await Services.get().activityUpdated({ period });
    }
  }
}

window.customElements.define('m-countdown', CountdownComponent);
