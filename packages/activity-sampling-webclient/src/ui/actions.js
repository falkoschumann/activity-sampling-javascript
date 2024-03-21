import { ServiceLocator } from 'activity-sampling-shared';

import * as services from '../application/services.js';
import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { createStore } from '../util/store.js';
import { Notifier } from './notifier.js';

export const store = createStore(reducer);

export const serviceLocator = new ServiceLocator();
serviceLocator.register('api', Api.create());

const notifer = new Notifier();

// TODO create missing service functions for notifier
// TODO on startup refresh and request notifications

export async function activityLogged({ client, project, task, notes }) {
  // TODO use form data instead of store?
  const api = serviceLocator.resolve('api');
  await services.logActivity({ client, project, task, notes }, store, api);
  await services.selectRecentActivities(store, api);
  activityChanged();
}

export async function notificationsRequested({ deliverIn }) {
  notifer.start(deliverIn);
}

export async function stopNotificationsRequested() {
  notifer.stop();
  // TODO update state: currentActivity.isTimerRunning
}

export async function refreshRequested() {
  const api = serviceLocator.resolve('api');
  await services.selectRecentActivities(store, api);
  activityChanged();
}

/** @deprecated */
export async function activityUpdated({ name, value }) {
  // TODO use UI event instead of store?
  await services.activityUpdated({ name, value }, store);
}

export async function activitySelected({ client, project, task, notes }) {
  // TODO use UI event instead of store?
  await services.activitySelected({ client, project, task, notes }, store);
}

function activityChanged() {
  notifer.currentActivity = store.getState().currentActivity.task;
}

notifer.addEventListener('notification-scheduled', ({ deliverIn }) =>
  services.notificationScheduled({ deliverIn }, store),
);

notifer.addEventListener('countdown-progressed', ({ remaining }) =>
  services.countdownProgressed({ remaining }, store),
);

notifer.addEventListener('notification-presented', () => {
  // TODO is there something to do here
});

notifer.addEventListener('notification-acknowledged', ({ activity }) =>
  services.notificationAcknowledged({ activity }, store),
);
