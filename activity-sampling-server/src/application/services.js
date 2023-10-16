import { createRecentActivities } from '../domain/recent-activities.js';
import { AbstractRepository } from '../infrastructure/repository.js';

export async function getRecentActivities(
  { today = new Date() } = {},
  repository = new AbstractRepository(),
) {
  let activities = await repository.findAll();
  return createRecentActivities(activities, today);
}

export async function logActivity(
  { timestamp, duration, client, project, task, notes },
  repository = new AbstractRepository(),
) {
  await repository.add({ timestamp, duration, client, project, task, notes });
}
