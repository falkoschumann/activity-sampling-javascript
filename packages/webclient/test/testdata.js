import { Duration } from '@activity-sampling/shared';

export function createActivityDto({
  timestamp = '2023-10-07T11:00Z',
  duration = 'PT30M',
  client = 'client 1',
  project = 'project 1',
  task = 'task 1',
  notes = 'notes 1',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}

export function createActivity({
  timestamp = new Date('2023-10-07T11:00Z'),
  duration = new Duration('PT30M'),
  client = 'client 1',
  project = 'project 1',
  task = 'task 1',
  notes = 'notes 1',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
