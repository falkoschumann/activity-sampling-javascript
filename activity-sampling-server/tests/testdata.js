import { Duration } from 'activity-sampling-shared';

export function createActivity({
  timestamp = new Date('2023-10-07T11:00Z'),
  duration = new Duration('PT30M'),
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
