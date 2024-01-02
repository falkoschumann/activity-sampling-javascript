import * as services from '../application/services.js';
import { Api } from '../infrastructure/api.js';
import { Timer } from '../infrastructure/timer.js';
import { store } from './store.js';

const api = globalThis.activitySampling?.api ?? new Api();
const timer = new Timer();

export async function startTimer() {
  await services.startTimer(store, timer);
}

export async function stopTimer() {
  await services.stopTimer(store, timer);
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
