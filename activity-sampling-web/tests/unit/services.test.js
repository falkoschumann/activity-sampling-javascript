import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import {
  getRecentActivities,
  logActivity,
} from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { Store } from '../../src/domain/store.js';
import { AbstractApi } from '../../src/infrastructure/api.js';

let store;

beforeEach(() => {
  store = new Store(reducer, initialState);
});

describe('get recent activities', () => {
  test('returns multiple activities on same day sorted by time descending', async () => {
    let api = new FakeApi();

    await getRecentActivities(store, api);

    expect(store.getState().recentActivities).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2023-10-07T13:00Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:30Z') }),
            createActivity({ timestamp: new Date('2023-10-07T12:00Z') }),
          ],
        },
      ],
      timeSummary: {
        hoursToday: 1.5,
        hoursYesterday: 0,
        hoursThisWeek: 1.5,
        hoursThisMonth: 1.5,
      },
    });
  });
});

describe('log activity', () => {
  test('logs activity', async () => {
    let api = new FakeApi();

    await logActivity(
      {
        timestamp: new Date('2023-10-07T13:30Z'),
        duration: 0.5,
        client: 'Muspellheim',
        project: 'Activity Sampling',
        task: 'Log activity',
        notes: 'Log the activity',
      },
      api,
    );

    expect(api.postLogActivity).toHaveBeenNthCalledWith(1, {
      timestamp: new Date('2023-10-07T13:30Z'),
      duration: 0.5,
      client: 'Muspellheim',
      project: 'Activity Sampling',
      task: 'Log activity',
      notes: 'Log the activity',
    });
  });
});

class FakeApi extends AbstractApi {
  postLogActivity = jest.fn();

  constructor({
    recentActivities = {
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
      timeSummary: {
        hoursToday: 1.5,
        hoursYesterday: 0,
        hoursThisWeek: 1.5,
        hoursThisMonth: 1.5,
      },
    },
  } = {}) {
    super();
    this.recentActivities = recentActivities;
  }

  async getRecentActivities() {
    return this.recentActivities;
  }
}

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
