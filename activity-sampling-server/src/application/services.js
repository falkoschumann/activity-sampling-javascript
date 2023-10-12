import { createRecentActivities } from '../domain/recent-activities.js';
import { AbstractRepository } from '../infrastructure/repository.js';

export async function getRecentActivities(
  { today = new Date() } = {},
  repository = new AbstractRepository(),
) {
  let activities = await repository.findAll();
  return createRecentActivities(activities, today);
}
