import { html } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';

import { Duration } from '@activity-sampling/shared';

import './countdown.css';
import { Component } from './components.js';

import { ref } from 'lit-html/directives/ref.js';

const COUNTDOWN_STARTED_EVENT = 'countdown-started';
const COUNTDOWN_STOPPED_EVENT = 'countdown-stopped';

class CountdownStartedEvent extends Event {
  constructor(period) {
    super(COUNTDOWN_STARTED_EVENT);
    this.period = period;
  }
}

class CountdownStoppedEvent extends Event {
  constructor() {
    super(COUNTDOWN_STOPPED_EVENT);
  }
}

export class CountdownComponent extends Component {
  #periodRef;

  #value = {
    isRunning: false,
    period: new Duration('PT30M'),
    remainingTime: new Duration('PT30M'),
  };

  get value() {
    return this.#value;
  }

  set value(value) {
    if (this.#value === value) {
      return;
    }

    this.#value = value;
    this.updateView();
  }

  getView() {
    const progress = 1 - this.#value.remainingTime / this.#value.period;
    const title = this.#value.isRunning ? 'Stop countdown' : 'Start countdown';
    return html`
      <div class="progress">
        <span>${this.#value.remainingTime}</span>
        <progress max="1" value=${progress}></progress>
      </div>
      <button
        class="icon-only switch ${classMap({ on: this.#value.isRunning })}"
        title=${title}
        aria-label=${title}
        @click=${this.#toggle}
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

  #toggle() {
    if (this.#value.isRunning) {
      this.dispatchEvent(new CountdownStoppedEvent());
    } else {
      const period = new Duration(`PT${this.#periodRef.value}M`);
      this.dispatchEvent(new CountdownStartedEvent(period));
    }
  }
}

window.customElements.define('m-countdown', CountdownComponent);
