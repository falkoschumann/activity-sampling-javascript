import { createRecentActivities } from '../domain/recent-activities.js';

export async function getRecentActivities(
  { today = new Date() } = {},
  repository,
) {
  let activities = await repository.findAll();
  return createRecentActivities(activities, today);
}

export async function logActivity(
  { timestamp, duration, client, project, task, notes },
  repository,
) {
  await repository.add({ timestamp, duration, client, project, task, notes });
}
