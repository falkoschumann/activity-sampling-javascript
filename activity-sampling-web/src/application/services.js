import { AbstractStore } from '../domain/store.js';
import { AbstractApi } from '../infrastructure/api.js';

export async function getRecentActivities(
  store = new AbstractStore(),
  api = new AbstractApi(),
) {
  let recentActivities = await api.getRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}

export async function logActivity(
  { timestamp, duration, client, project, task, notes },
  api = new AbstractApi(),
) {
  let activity = { timestamp, duration, client, project, task, notes };
  await api.postLogActivity(activity);
}
