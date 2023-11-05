import { Duration } from 'activity-sampling-shared';

import { AbstractStore } from '../domain/store.js';
import { AbstractApi } from '../infrastructure/api.js';

export async function progressTicked(
  { duration = new Duration('PT1S') } = {},
  store = new AbstractStore(),
) {
  store.dispatch({ type: 'progress-ticked', duration });
}

export async function activityUpdated(
  { name, value },
  store = new AbstractStore(),
) {
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function setActivity(
  { client, project, task, notes },
  store = new AbstractStore(),
) {
  store.dispatch({
    type: 'set-activity',
    client,
    project,
    task,
    notes,
  });
}

export async function logActivity(
  { timestamp = new Date() } = {},
  store = new AbstractStore(),
  api = new AbstractApi(),
) {
  let duration = store.getState().currentTask.duration;
  let { client, project, task, notes } = store.getState().activityForm;
  let activity = { timestamp, duration, client, project, task, notes };
  await api.postLogActivity(activity);
  store.dispatch({ type: 'activity-logged' });
}

export async function getRecentActivities(
  store = new AbstractStore(),
  api = new AbstractApi(),
) {
  let recentActivities = await api.getRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}
