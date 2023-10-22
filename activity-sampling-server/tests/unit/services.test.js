import { describe, expect, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';

import {
  getRecentActivities,
  logActivity,
} from '../../src/application/services.js';
import { AbstractRepository } from '../../src/infrastructure/repository.js';

import { createActivity } from '../testdata.js';

describe('get recent activities', () => {
  describe('working days', () => {
    test('returns multiple activities on same day sorted by time descending', async () => {
      let repository = new FakeRepository([
        createActivity({ timestamp: new Date('2023-10-07T13:00:00') }),
        createActivity({ timestamp: new Date('2023-10-07T12:30:00') }),
        createActivity({ timestamp: new Date('2023-10-07T12:00:00') }),
      ]);

      let result = await getRecentActivities({}, repository);

      expect(result.workingDays).toEqual([
        {
          date: new Date('2023-10-07T00:00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T13:00:00') }),
            createActivity({ timestamp: new Date('2023-10-07T12:30:00') }),
            createActivity({ timestamp: new Date('2023-10-07T12:00:00') }),
          ],
        },
      ]);
    });

    test('returns activities on multiple days sorted by date descending', async () => {
      let repository = new FakeRepository([
        createActivity({ timestamp: new Date('2023-10-08T13:00:00') }),
        createActivity({ timestamp: new Date('2023-10-07T12:30:00') }),
        createActivity({ timestamp: new Date('2023-10-06T12:00:00') }),
      ]);

      let result = await getRecentActivities({}, repository);

      expect(result.workingDays).toEqual([
        {
          date: new Date('2023-10-08T00:00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-08T13:00:00') }),
          ],
        },
        {
          date: new Date('2023-10-07T00:00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T12:30:00') }),
          ],
        },
        {
          date: new Date('2023-10-06T00:00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-06T12:00:00') }),
          ],
        },
      ]);
    });
  });

  describe('time summary', () => {
    test('sums hours today', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-08T13:30:00'), // tomorrow
          duration: new Duration(3600),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00'), // today
          duration: new Duration(1800),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00'), // today
          duration: new Duration(1200),
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00'), // yesterday
          duration: new Duration(900),
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-07T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: new Duration(3000),
        hoursYesterday: new Duration(900),
        hoursThisWeek: new Duration(3900),
        hoursThisMonth: new Duration(3900),
      });
    });

    test('sums hours yesterday', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-08T13:30:00'), // today
          duration: new Duration(3600),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00'), // yesterday
          duration: new Duration(1800),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00'), // yesterday
          duration: new Duration(1200),
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00'), // the day before yesterday
          duration: new Duration(900),
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-08T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: new Duration(3600),
        hoursYesterday: new Duration(3000),
        hoursThisWeek: new Duration(7500),
        hoursThisMonth: new Duration(7500),
      });
    });

    test('sums hours this week', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-16T13:30:00'), // monday next week
          duration: new Duration(3600),
        }),
        createActivity({
          timestamp: new Date('2023-10-15T13:00:00'), // sunday this week
          duration: new Duration(1800),
        }),
        createActivity({
          timestamp: new Date('2023-10-09T12:30:00'), // monday this week
          duration: new Duration(1200),
        }),
        createActivity({
          timestamp: new Date('2023-10-08T12:00:00'), // sunday last week
          duration: new Duration(900),
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-15T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: new Duration(1800),
        hoursYesterday: new Duration(0),
        hoursThisWeek: new Duration(3000),
        hoursThisMonth: new Duration(3900),
      });
    });

    test('sums hours this month', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-11-01T13:30:00'), // first day next month
          duration: new Duration(3600),
        }),
        createActivity({
          timestamp: new Date('2023-10-31T13:00:00'), // last day this month
          duration: new Duration(1800),
        }),
        createActivity({
          timestamp: new Date('2023-10-01T12:30:00'), // first day this month
          duration: new Duration(1200),
        }),
        createActivity({
          timestamp: new Date('2023-09-30T12:00:00'), // last day last month
          duration: new Duration(900),
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-31T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: new Duration(1800),
        hoursYesterday: new Duration(0),
        hoursThisWeek: new Duration(1800),
        hoursThisMonth: new Duration(3000),
      });
    });
  });
});

describe('log activity', () => {
  test('adds activity to repository', async () => {
    let repository = new FakeRepository();

    await logActivity(createActivity(), repository);

    let activities = await repository.findAll();
    expect(activities).toEqual([createActivity()]);
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

  async add(activity) {
    this.#activityLog.push(activity);
  }
}
