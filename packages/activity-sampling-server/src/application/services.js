import {
  RecentActivities,
  ActivityLogged,
  RecentActivitiesQuery,
  LogActivity,
} from '../domain/activities.js';
import { Repository } from '../infrastructure/repository.js';

export async function logActivity(
  { timestamp, duration, client, project, task, notes } = LogActivity.create(),
  repository = Repository.create(),
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
  { today } = RecentActivitiesQuery.create(),
  repository = Repository.create(),
) {
  let activities = await repository.replay();
  return RecentActivities.create({ activities, today });
}
