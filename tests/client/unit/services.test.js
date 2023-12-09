import { describe, expect, jest, test } from '@jest/globals';

import {
  activityUpdated,
  getRecentActivities,
  logActivity,
  progressTicked,
  setActivity,
} from '../../../public/js/application/services.js';
import { Duration } from '../../../public/js/domain/duration.js';
import { initialState, reducer } from '../../../public/js/domain/reducer.js';
import { Store } from '../../../public/js/domain/store.js';
import { AbstractApi } from '../../../public/js/infrastructure/api.js';

describe('progress ticked', () => {
  test('increases progress and decreases remaining time', async () => {
    let store = createStore({
      ...initialState,
      currentTask: {
        duration: new Duration('PT30M'),
        remainingTime: new Duration('PT21M'),
        progress: 0.7,
        inProgress: true,
      },
    });

    await progressTicked({ duration: new Duration('PT3M') }, store);
import { createActivity } from '../../testdata.js';

    expect(store.getState().currentTask).toEqual({
      duration: new Duration('PT30M'),
      remainingTime: new Duration('PT18M'),
      progress: 0.4,
      inProgress: true,
    });
  });

  test('finish current task', async () => {
    let store = createStore({
      ...initialState,
      activityForm: {
        ...initialState.activityForm,
        timestamp: undefined,
        duration: undefined,
        formDisabled: true,
        logButtonDisabled: false,
      },
      currentTask: {
        duration: new Duration('PT30M'),
        remainingTime: new Duration('PT1M'),
        progress: 0.97,
        inProgress: true,
      },
    });

    await progressTicked({ duration: new Duration('PT1M') }, store);

    expect(store.getState().activityForm).toEqual({
      ...initialState.activityForm,
      timestamp: undefined,
      duration: new Duration('PT30M'),
      formDisabled: false,
      logButtonDisabled: false,
    });
    expect(store.getState().currentTask).toEqual({
      duration: new Duration('PT30M'),
      remainingTime: new Duration('PT0S'),
      progress: 1.0,
      inProgress: true,
    });
  });
});

describe('activity updated', () => {
  test('updates activity', async () => {
    let store = createStore();

    await activityUpdated({ name: 'client', value: 'Muspellheim' }, store);

    expect(store.getState().activityForm).toEqual({
      ...initialState.activityForm,
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
    let store = createStore();

    await setActivity(
      {
        client: 'foo',
        project: 'bar',
        task: 'lorem',
        notes: 'ipsum',
      },
      store,
    );

    expect(store.getState().activityForm).toEqual({
      ...initialState.activityForm,
      client: 'foo',
      project: 'bar',
      task: 'lorem',
      notes: 'ipsum',
    });
  });
});

describe('log activity', () => {
  test('logs activity', async () => {
    let store = createStore({
      ...initialState,
      activityForm: {
        ...initialState.activityForm,
        client: 'Muspellheim',
        project: 'Activity Sampling',
        task: 'Log activity',
        notes: 'Log the activity',
      },
    });
    let api = new FakeApi();

    await logActivity(
      {
        timestamp: new Date('2023-10-07T13:30Z'),
      },
      store,
      api,
    );

    expect(store.getState().activityForm).toEqual({
      ...initialState.activityForm,
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

describe('get recent activities', () => {
  test('returns multiple activities on same day sorted by time descending', async () => {
    let store = createStore();
    let api = new FakeApi();

    await getRecentActivities(store, api);

    expect(store.getState().recentActivities).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00Z'),
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

function createActivity({
  timestamp = new Date('2023-10-07T13:00Z'),
  duration = new Duration(1800),
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}

function createStore(state = initialState) {
  return new Store(reducer, state);
}

class FakeApi extends AbstractApi {
  postLogActivity = jest.fn();

  constructor({
    recentActivities = {
      workingDays: [
        {
          date: new Date('2023-10-07T00:00Z'),
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
    },
  } = {}) {
    super();
    this.recentActivities = recentActivities;
  }

  async getRecentActivities() {
    return this.recentActivities;
  }
}
