import { Duration, ServiceLocator } from 'activity-sampling-shared';

import { Timer } from '../infrastructure/timer.js';
import { store } from './store.js';
import services from '../application/services.js';

export const serviceLocator = new ServiceLocator();

// TODO replace Timer with Notifier
const timer = new Timer((delay) =>
  services.timerTicked({ duration: new Duration(delay) }, store),
);

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
  const api = serviceLocator.resolve('api');
  await services.logActivity(undefined, store, api);
  await services.getRecentActivities(store, api);
}

export async function getRecentActivities() {
  const api = serviceLocator.resolve('api');
  await services.getRecentActivities(store, api);
}

export default {
  activityLogged,
  refreshRequest,
  activityUpdated,
  activitySelected,
};
