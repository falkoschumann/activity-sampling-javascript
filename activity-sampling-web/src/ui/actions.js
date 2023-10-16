import { html, render } from 'lit-html';

import { getRecentActivities, logActivity } from '../application/services.js';
import { initialState, reducer } from '../domain/reducer.js';
import { Store } from '../domain/store.js';
import { Api } from '../infrastructure/api.js';

const store = new Store(reducer, initialState);
const api = new Api();

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

export async function getRecentActivitiesAction() {
  return await getRecentActivities(store, api);
}

export async function logActivityAction({ client, project, task, notes }) {
  await logActivity(
    {
      timestamp: new Date(),
      duration: 30,
      client,
      project,
      task,
      notes,
    },
    api,
  );
  await getRecentActivities(store, api);
}
