import { describe, expect, test } from '@jest/globals';

import { getRecentActivities } from '../../src/application/services.js';
import { AbstractRepository } from '../../src/infrastructure/repository.js';

describe('get recent activities', () => {
  describe('working days', () => {
    test('returns multiple activities on same day sorted by time descending', async () => {
      let repository = new FakeRepository([
        createActivity({ timestamp: new Date('2023-10-07T13:00:00Z') }),
        createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
        createActivity({ timestamp: new Date('2023-10-07T12:00:00Z') }),
      ]);

      let result = await getRecentActivities({}, repository);

      expect(result.workingDays).toEqual([
        {
          date: new Date('2023-10-07T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T13:00:00Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:00:00Z') }),
          ],
        },
      ]);
    });

    test('returns activities on multiple days sorted by date descending', async () => {
      let repository = new FakeRepository([
        createActivity({ timestamp: new Date('2023-10-08T13:00:00Z') }),
        createActivity({ timestamp: new Date('2023-10-07T12:30:00Z') }),
        createActivity({ timestamp: new Date('2023-10-06T12:00:00Z') }),
      ]);

      let result = await getRecentActivities({}, repository);

      expect(result.workingDays).toEqual([
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
      ]);
    });
  });

  describe('time summary', () => {
    test('sums hours today', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-08T13:30:00Z'), // tomorrow
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00Z'), // today
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00Z'), // today
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00Z'), // yesterday
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-07T14:00:00Z') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: 50,
        hoursYesterday: 15,
        hoursThisWeek: 65,
        hoursThisMonth: 65,
      });
    });

    test('sums hours yesterday', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-08T13:30:00Z'), // today
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00Z'), // yesterday
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00Z'), // yesterday
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00Z'), // the day before yesterday
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-08T14:00:00Z') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: 60,
        hoursYesterday: 50,
        hoursThisWeek: 125,
        hoursThisMonth: 125,
      });
    });

    test('sums hours this week', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-16T13:30:00Z'), // monday next week
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-15T13:00:00Z'), // sunday this week
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-09T12:30:00Z'), // monday this week
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-08T12:00:00Z'), // sunday last week
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-15T14:00:00Z') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: 30,
        hoursYesterday: 0,
        hoursThisWeek: 50,
        hoursThisMonth: 65,
      });
    });

    test('sums hours this month', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-11-01T13:30:00Z'), // first day next month
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-31T13:00:00Z'), // last day this month
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-01T12:30:00Z'), // first day this month
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-09-30T12:00:00Z'), // last day last month
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-31T14:00:00Z') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: 30,
        hoursYesterday: 0,
        hoursThisWeek: 30,
        hoursThisMonth: 50,
      });
    });
  });
});

export class FakeRepository extends AbstractRepository {
  #activityLog;

  constructor(activityLog = []) {
    super();
    this.#activityLog = activityLog;
  }

  async findAll() {
    return this.#activityLog;
  }
}

function createActivity({
  timestamp = new Date('2023-10-07T13:00:00Z'),
  duration = 30,
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
