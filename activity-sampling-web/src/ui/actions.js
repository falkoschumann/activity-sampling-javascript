import { html, render } from 'lit-html';

import * as services from '../application/services.js';
import { initialState, reducer } from '../domain/reducer.js';
import { Store } from '../domain/store.js';
import { Api } from '../infrastructure/api.js';

const store = new Store(reducer, initialState);
const api = globalThis.activitySampling?.api ?? new Api();

export class Component extends HTMLElement {
  constructor() {
    super();
    this.oldState = this.state = {};
  }

  connectedCallback() {
    this.unsubscribe = store.subscribe(() => this.updateView());
    this.updateView();
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  updateView() {
    this.state = this.extractState(store.getState());
    if (this.state === this.oldState) {
      return;
    }

    render(this.getView(), this.getRenderTarget());
    this.oldState = this.state;
  }

  extractState(state) {
    return state;
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}

export async function progressTicked({ seconds }) {
  await services.progressTicked({ seconds }, store);
}

export async function activityUpdated({ name, value }) {
  await services.activityUpdated({ name, value }, store);
}

export async function setActivity({ client, project, task, notes }) {
  await services.setActivity({ client, project, task, notes }, store);
}

export async function logActivity() {
  await services.logActivity(undefined, store, api);
  await services.getRecentActivities(store, api);
}

export async function getRecentActivities() {
  await services.getRecentActivities(store, api);
}
