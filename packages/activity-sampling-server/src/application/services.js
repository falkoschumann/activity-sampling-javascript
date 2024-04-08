import { RecentActivities, ActivityLogged } from '../domain/activities.js';

/**
 * @typedef {import('../domain/activities.js').LogActivity} LogActivity
 * @typedef {import('../infrastructure/repository.js').Repository} Repository
 */

export async function logActivity(
  /** @type {LogActivity} */ {
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  },
  /** @type {Repository} */ repository,
) {
  const activityLogged = ActivityLogged.create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  });
  await repository.record(activityLogged);
}

export async function selectRecentActivities(
  { today = new Date() } = {},
  /** @type {Repository} */ repository,
) {
  let activities = await repository.replay();
  return RecentActivities.create({ activities, today });
}
