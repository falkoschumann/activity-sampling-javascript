import { createRecentActivities } from '../domain/recent-activities';
import { AbstractRepository } from '../infrastructure/repository.js';

export async function getRecentActivities(
  repository = new AbstractRepository(),
) {
  let activities = await repository.findAll();
  return createRecentActivities(activities);
}
