import { describe, expect, test } from '@jest/globals';

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
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00'), // today
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00'), // today
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00'), // yesterday
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-07T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: expect.closeTo(50 / 60, 5),
        hoursYesterday: expect.closeTo(15 / 60, 5),
        hoursThisWeek: expect.closeTo(65 / 60, 5),
        hoursThisMonth: expect.closeTo(65 / 60, 5),
      });
    });

    test('sums hours yesterday', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-08T13:30:00'), // today
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T13:00:00'), // yesterday
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30:00'), // yesterday
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-06T12:00:00'), // the day before yesterday
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-08T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: expect.closeTo(60 / 60, 5),
        hoursYesterday: expect.closeTo(50 / 60, 5),
        hoursThisWeek: expect.closeTo(125 / 60, 5),
        hoursThisMonth: expect.closeTo(125 / 60, 5),
      });
    });

    test('sums hours this week', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-10-16T13:30:00'), // monday next week
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-15T13:00:00'), // sunday this week
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-09T12:30:00'), // monday this week
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-10-08T12:00:00'), // sunday last week
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-15T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: expect.closeTo(30 / 60, 5),
        hoursYesterday: expect.closeTo(0 / 60, 5),
        hoursThisWeek: expect.closeTo(50 / 60, 5),
        hoursThisMonth: expect.closeTo(65 / 60, 5),
      });
    });

    test('sums hours this month', async () => {
      let repository = new FakeRepository([
        createActivity({
          timestamp: new Date('2023-11-01T13:30:00'), // first day next month
          duration: 60,
        }),
        createActivity({
          timestamp: new Date('2023-10-31T13:00:00'), // last day this month
          duration: 30,
        }),
        createActivity({
          timestamp: new Date('2023-10-01T12:30:00'), // first day this month
          duration: 20,
        }),
        createActivity({
          timestamp: new Date('2023-09-30T12:00:00'), // last day last month
          duration: 15,
        }),
      ]);

      let result = await getRecentActivities(
        { today: new Date('2023-10-31T14:00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: expect.closeTo(30 / 60, 5),
        hoursYesterday: expect.closeTo(0 / 60, 5),
        hoursThisWeek: expect.closeTo(30 / 60, 5),
        hoursThisMonth: expect.closeTo(50 / 60, 5),
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
