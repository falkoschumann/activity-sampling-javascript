import { createRecentActivities } from '../domain/recent-activities';

export async function getRecentActivities(repository) {
  let activities = await repository.findAll();
  return createRecentActivities(activities);
}
