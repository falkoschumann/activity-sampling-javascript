import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared/src/index.js';

import {
  activityUpdated,
  getRecentActivities,
  logActivity,
  progressTicked,
  setActivity,
} from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { Store } from '../../src/domain/store.js';
import { AbstractApi } from '../../src/infrastructure/api.js';

let store;

beforeEach(() => {
  store = new Store(reducer, initialState);
});

describe('activity updated', () => {
  test('updates activity', async () => {
    await activityUpdated({ name: 'client', value: 'Muspellheim' }, store);

    expect(store.getState().activity).toEqual({
      client: 'Muspellheim',
      project: '',
      task: '',
      notes: '',
      logButtonDisabled: false,
    });
  });
});

describe('set activity', () => {
  test('sets activity', async () => {
    await setActivity(
      {
        client: 'foo',
        project: 'bar',
        task: 'lorem',
        notes: 'ipsum',
      },
      store,
    );

    expect(store.getState().activity).toEqual({
      client: 'foo',
      project: 'bar',
      task: 'lorem',
      notes: 'ipsum',
    });
  });
});

describe('progress ticked', () => {
  test('increases progress', async () => {
    await progressTicked({ duration: new Duration(720) }, store);

    expect(store.getState().task).toEqual({
      duration: new Duration(1800),
      remainingDuration: new Duration(1080),
      progress: 0.4,
    });
  });
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
    await setActivity(
      {
        client: 'Muspellheim',
        project: 'Activity Sampling',
        task: 'Log activity',
        notes: 'Log the activity',
      },
      store,
    );

    await logActivity(
      {
        timestamp: new Date('2023-10-07T13:30Z'),
      },
      store,
      api,
    );

    expect(store.getState().activity).toEqual({
      client: 'Muspellheim',
      project: 'Activity Sampling',
      task: 'Log activity',
      notes: 'Log the activity',
      logButtonDisabled: true,
    });
    expect(api.postLogActivity).toHaveBeenNthCalledWith(1, {
      timestamp: new Date('2023-10-07T13:30Z'),
      duration: new Duration(1800),
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
  duration = 30,
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
