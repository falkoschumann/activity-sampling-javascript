import { describe, expect, jest, test } from '@jest/globals';

import {
  activityUpdated,
  getRecentActivities,
  logActivity,
  timerTicked,
  setActivity,
  startTimer,
  stopTimer,
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
      isLogButtonDisabled: false,
    });
  });

  describe('Asks periodically what I am working on', () => {
    test('Starts timer', async () => {
      let timer = new FakeTimer();
      let store = createStore();

      startTimer(store, timer);

      expect(store.getState().activityForm).toEqual({
        ...initialState.activityForm,
        remainingTime: new Duration('PT30M'),
        progress: 0.0,
        isTimerRunning: true,
      });
      expect(timer.start).toBeCalledTimes(1);
    });

    test('Increases progress and decreases remaining time', async () => {
      let store = createStore({
        ...initialState,
        activityForm: {
          ...initialState.activityForm,
          remainingTime: new Duration('PT21M'),
          progress: 0.7,
          isTimerRunning: true,
        },
      });

      await timerTicked({ duration: new Duration('PT3M') }, store);

      expect(store.getState().activityForm).toEqual({
        ...initialState.activityForm,
        remainingTime: new Duration('PT18M'),
        progress: 0.4,
        isTimerRunning: true,
      });
    });

    test('Finishs current task', async () => {
      let store = createStore({
        ...initialState,
        activityForm: {
          ...initialState.activityForm,
          timestamp: undefined,
          isFormDisabled: true,
          isLogButtonDisabled: false,
          remainingTime: new Duration('PT1M'),
          progress: 0.97,
          isTimerRunning: true,
        },
      });

      await timerTicked({ duration: new Duration('PT1M') }, store);

      expect(store.getState().activityForm).toEqual({
        ...initialState.activityForm,
        timestamp: undefined,
        isFormDisabled: false,
        isLogButtonDisabled: false,
        remainingTime: new Duration('PT0S'),
        progress: 1.0,
        isTimerRunning: true,
      });
    });

    test('Stops timer and resets progress', async () => {
      let store = createStore({
        ...initialState,
        activityForm: {
          ...initialState.activityForm,
          remainingTime: new Duration('PT12M'),
          progress: 0.6,
          isTimerRunning: true,
        },
      });
      let timer = new FakeTimer();

      await stopTimer(store, timer);

      expect(store.getState().activityForm).toEqual({
        ...initialState.activityForm,
        remainingTime: new Duration('PT30M'),
        progress: 0.0,
        isTimerRunning: false,
      });
      expect(timer.stop).toBeCalledTimes(1);
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
      isLogButtonDisabled: true,
    });
    expect(api.postLogActivity).toHaveBeenNthCalledWith(1, {
      timestamp: new Date('2023-10-07T13:30Z'),
      duration: new Duration('PT30M'),
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

class FakeTimer {
  start = jest.fn();
  stop = jest.fn();
}
