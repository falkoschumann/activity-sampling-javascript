import { describe, expect, test } from '@jest/globals';

import { Duration } from '../../../public/js/domain/duration.js';
import '../../equality-testers.js';

import {
  getRecentActivities,
  logActivity,
} from '../../../src/application/services.js';
import { AbstractRepository } from '../../../src/infrastructure/repository.js';

import { createActivity } from '../testdata.js';

describe('get recent activities', () => {
  test('returns working days and time summary', async () => {
    let repository = new FakeRepository([
      createActivity({ timestamp: new Date('2023-10-05T12:00') }),
      createActivity({ timestamp: new Date('2023-10-06T12:00') }),
      createActivity({ timestamp: new Date('2023-10-06T12:30') }),
      createActivity({ timestamp: new Date('2023-10-07T12:00') }),
    ]);

    let result = await getRecentActivities(
      { today: new Date('2023-10-07T00:00') },
      repository,
    );

    expect(result).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T12:00') }),
          ],
        },
        {
          date: new Date('2023-10-06T00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-06T12:30') }),
            createActivity({ timestamp: new Date('2023-10-06T12:00') }),
          ],
        },
        {
          date: new Date('2023-10-05T00:00'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-05T12:00') }),
          ],
        },
      ],
      timeSummary: {
        hoursToday: new Duration('PT30M'),
        hoursYesterday: new Duration('PT1H'),
        hoursThisWeek: new Duration('PT2H'),
        hoursThisMonth: new Duration('PT2H'),
      },
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
