import * as services from '../application/services.js';
import { reducer } from '../domain/reducer.js';
import { createStore } from '../domain/store.js';
import { Api } from '../infrastructure/api.js';

export const store = createStore(reducer);
const api = globalThis.activitySampling?.api ?? new Api();

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
