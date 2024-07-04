import * as services from '../application/services.js';
import { Api } from '../infrastructure/api.js';
import store from './store.js';
import { Notifier } from './notifier.js';

const api = Api.create();

const notifer = new Notifier();

// TODO remove actions if services are used directly
// TODO create missing service functions for notifier
// TODO on startup refresh and request notifications

export async function activityLogged({ client, project, task, notes }) {
  // TODO use form data instead of store?
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
  await services.selectRecentActivities(store, api);
  activityChanged();
}

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
