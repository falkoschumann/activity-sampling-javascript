import { describe, expect, test } from '@jest/globals';

import { Duration } from '../../../public/js/domain/duration.js';

import {
  getRecentActivities,
  logActivity,
} from '../../../src/application/services.js';
import { AbstractRepository } from '../../../src/infrastructure/repository.js';

import { createActivity } from '../../testdata.js';

describe('Log activity', () => {
  test('Logs the activity', async () => {
    let repository = new FakeRepository();

    await logActivity(createActivity(), repository);

    let activities = await repository.findAll();
    expect(activities).toEqual([createActivity()]);
  });
});

describe('Recent activities', () => {
  test('Contains working days', async () => {
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

    expect(result.workingDays).toEqual([
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
    ]);
  });

  test('Contains time summary', async () => {
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

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT30M'),
      hoursYesterday: new Duration('PT1H'),
      hoursThisWeek: new Duration('PT2H'),
      hoursThisMonth: new Duration('PT2H'),
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

  async add(activity) {
    this.#activityLog.push(activity);
  }
}
