import { getRecentActivities } from '../application/services.js';
import { FakeRepository } from '../infrastructure/repository.js';

let repository = new FakeRepository([
  {
    timestamp: new Date('2023-10-07T13:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:30:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
]);

export async function getRecentActivitiesAction() {
  return await getRecentActivities(repository);
}
