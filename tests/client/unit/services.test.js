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

import { createActivity } from '../../testdata.js';

describe('Log activity', () => {
  test('Enters activity', async () => {
    let store = createStore();

    await activityUpdated({ name: 'client', value: 'Muspellheim' }, store);
    await activityUpdated(
      { name: 'project', value: 'Activity Sampling' },
      store,
    );
    await activityUpdated({ name: 'task', value: 'Enters activity' }, store);
    await activityUpdated({ name: 'notes', value: 'Need more tests' }, store);

    expect(store.getState().activityForm).toEqual({
      ...initialState.activityForm,
      client: 'Muspellheim',
      project: 'Activity Sampling',
      task: 'Enters activity',
      notes: 'Need more tests',
      logButtonDisabled: false,
    });
  });

  describe('Asks periodically what I am working on', () => {
    test('Increases progress and decreases remaining time', async () => {
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

      expect(store.getState().currentTask).toEqual({
        duration: new Duration('PT30M'),
        remainingTime: new Duration('PT18M'),
        progress: 0.4,
        inProgress: true,
      });
    });

    test('Finishs current task', async () => {
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

  test('Logs the activity', async () => {
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

  test('Selects an activity from recent activities', async () => {
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

describe('Recent activities', () => {
  test('Contains working days', async () => {
    let store = createStore();
    let api = new FakeApi();

    await getRecentActivities(store, api);

    expect(store.getState().recentActivities.workingDays).toEqual([
      {
        date: new Date('2023-10-07T00:00Z'),
        activities: [
          createActivity({ timestamp: new Date('2023-10-07T13:00Z') }),
          createActivity({ timestamp: new Date('2023-10-07T12:30Z') }),
          createActivity({ timestamp: new Date('2023-10-07T12:00Z') }),
        ],
      },
    ]);
  });

  test('Contains time summary', async () => {
    let store = createStore();
    let api = new FakeApi();

    await getRecentActivities(store, api);

    expect(store.getState().recentActivities.timeSummary).toEqual({
      hoursToday: 1.5,
      hoursYesterday: 0,
      hoursThisWeek: 1.5,
      hoursThisMonth: 1.5,
    });
  });
});

function createStore(state = initialState) {
  return new Store(reducer, state);
}

class FakeApi {
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
    this.recentActivities = recentActivities;
  }

  async getRecentActivities() {
    return this.recentActivities;
  }
}
