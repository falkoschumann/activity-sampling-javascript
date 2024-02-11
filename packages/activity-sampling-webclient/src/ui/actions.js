import { Duration, ServiceLocator } from 'activity-sampling-shared';

import services from '../application/services.js';
import { reducer } from '../domain/reducer.js';
import { createStore } from '../util/store.js';
import { Api } from '../infrastructure/api.js';
import { Notifier } from './notifier.js';

export const store = createStore(reducer);

export const serviceLocator = new ServiceLocator();
serviceLocator.register('api', Api.create());

const notifer = new Notifier();

// TODO create missing service functions for notifier
// TODO on startup refresh and request notifications

export async function activityLogged() {
  // TODO use form data instead of store?
  const api = serviceLocator.resolve('api');
  await services.logActivity(undefined, store, api);
  await services.getRecentActivities(store, api);
  activityChanged();
}

export async function notificationsRequested() {
  notifer.start(new Duration('PT1M'));
}

export async function stopNotificationsRequested() {
  notifer.stop();
}

export async function refreshRequest() {
  const api = serviceLocator.resolve('api');
  await services.getRecentActivities(store, api);
  activityChanged();
}

export async function activityUpdated({ name, value }) {
  // TODO use UI event instead of store?
  await services.activityUpdated({ name, value }, store);
}

export async function activitySelected({ client, project, task, notes }) {
  // TODO use UI event instead of store?
  await services.setActivity({ client, project, task, notes }, store);
}

function activityChanged() {
  notifer.currentActivity = store.getState().activityForm.task;
}

notifer.addEventListener('notification-scheduled', ({ deliverIn }) =>
  services.notificationScheduled({ deliverIn }, store),
);
notifer.addEventListener('countdown-progressed', ({ remaining }) =>
  services.countdownProgressed({ remaining }, store),
);
notifer.addEventListener('notification-presented', () =>
  services.notificationPresented(store),
);
notifer.addEventListener('notification-acknowledged', ({ activity }) =>
  services.notificationAcknowledged({ activity }, store),
);

export default {
  activityLogged,
  notificationsRequested,
  stopNotificationsRequested,
  refreshRequest,
  activityUpdated,
  activitySelected,
};
