import { describe, expect, test } from '@jest/globals';

import { getRecentActivities } from '../../src/application/services.js';
import { FakeRepository } from '../../src/infrastructure/repository.js';

describe('get recent activities', () => {
  test('returns multiple activities on same day sorted by time descending', async () => {
    let repository = new FakeRepository([
      createActivity({ timestamp: new Date('2023-10-07T13:00:00Z') }),
      createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
      createActivity({ timestamp: new Date('2023-10-07T12:00:00Z') }),
    ]);

    let result = await getRecentActivities(repository);

    expect(result).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T13:00:00Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:00:00Z') }),
          ],
        },
      ],
    });
  });

  test('returns activities on multiple days sorted by date descending', async () => {
    let repository = new FakeRepository([
      createActivity({ timestamp: new Date('2023-10-08T13:00:00Z') }),
      createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
      createActivity({ timestamp: new Date('2023-10-06T12:00:00Z') }),
    ]);

    let result = await getRecentActivities(repository);

    expect(result).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-08T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-08T13:00:00Z') }),
          ],
        },
        {
          date: new Date('2023-10-07T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
          ],
        },
        {
          date: new Date('2023-10-06T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-06T12:00:00Z') }),
          ],
        },
      ],
    });
  });
});

function createActivity({
  timestamp = new Date('2023-10-07T13:00:00Z'),
  duration = 'PT30M',
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
