import { describe, expect, jest, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';
import {
  activityUpdated,
  getHoursWorked,
  getRecentActivities,
  logActivity,
  timerTicked,
  setActivity,
  startTimer,
  stopTimer,
} from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { Store } from '../../src/util/store.js';
import { createActivity } from '../testdata.js';
import { Api } from '../../src/infrastructure/api.js';

describe('Services', () => {
  describe('Log activity', () => {
    test('Enters activity', async () => {
      let store = createStore();

      await activityUpdated({ name: 'client', value: 'c1' }, store);
      await activityUpdated({ name: 'project', value: 'p1' }, store);
      await activityUpdated({ name: 'task', value: 't1' }, store);
      await activityUpdated({ name: 'notes', value: 'n1' }, store);

      expect(store.getState().activityForm).toEqual({
        ...initialState.activityForm,
        client: 'c1',
        project: 'p1',
        task: 't1',
        notes: 'n1',
      });
    });

    describe('Asks periodically what I am working on', () => {
      test('Starts timer', async () => {
        let timer = new FakeTimer();
        let store = createStore({
          ...initialState,
          activityForm: {
            ...initialState.activityForm,
            isFormDisabled: false,
            remainingTime: new Duration('PT20M'),
            progress: 0.2,
            isTimerRunning: false,
          },
        });

        startTimer(store, timer);

        expect(store.getState().activityForm).toEqual({
          ...initialState.activityForm,
          isFormDisabled: true,
          remainingTime: new Duration('PT30M'),
          progress: 0,
          isTimerRunning: true,
        });
        expect(timer.start).toBeCalledTimes(1);
      });

      test('Increases progress and decreases remaining time', async () => {
        let store = createStore({
          ...initialState,
          activityForm: {
            ...initialState.activityForm,
            isFormDisabled: true,
            remainingTime: new Duration('PT21M'),
            progress: 0.7,
            isTimerRunning: true,
          },
        });

        await timerTicked({ duration: new Duration('PT3M') }, store);

        expect(store.getState().activityForm).toEqual({
          ...initialState.activityForm,
          isFormDisabled: true,
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
          remainingTime: new Duration('PT30M'),
          progress: 0,
          isTimerRunning: true,
        });
      });

      test('Stops timer and resets activity form', async () => {
        let store = createStore({
          ...initialState,
          activityForm: {
            ...initialState.activityForm,
            isFormDisabled: true,
            remainingTime: new Duration('PT12M'),
            progress: 0.6,
            isTimerRunning: true,
          },
        });
        let timer = new FakeTimer();

        await stopTimer(store, timer);

        expect(store.getState().activityForm).toEqual({
          ...initialState.activityForm,
          isFormDisabled: false,
          remainingTime: new Duration('PT30M'),
          progress: 0,
          isTimerRunning: false,
        });
        expect(timer.stop).toBeCalledTimes(1);
      });
    });

    describe('Logs the activity', () => {
      test('Leaves the form enabled if timer is not running', async () => {
        let store = createStore({
          ...initialState,
          activityForm: {
            ...initialState.activityForm,
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
            isFormDisabled: false,
            isTimerRunning: false,
          },
        });
        let api = Api.createNull({
          responses: [{ status: 201 }],
        });
        const activitiesLogged = api.trackActivitiesLogged();

        await logActivity(
          { timestamp: new Date('2023-10-07T13:30Z') },
          store,
          api,
        );

        expect(store.getState().activityForm).toEqual({
          ...initialState.activityForm,
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
          isFormDisabled: false,
          isTimerRunning: false,
        });
        expect(activitiesLogged.data).toEqual([
          {
            timestamp: new Date('2023-10-07T13:30Z'),
            duration: new Duration('PT30M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
          },
        ]);
      });

      test('Disables the form if timer is running', async () => {
        let store = createStore({
          ...initialState,
          activityForm: {
            ...initialState.activityForm,
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
            isFormDisabled: false,
            isTimerRunning: true,
          },
        });
        let api = Api.createNull({
          responses: [{ status: 201 }],
        });
        const activitiesLogged = api.trackActivitiesLogged();

        await logActivity(
          { timestamp: new Date('2023-10-07T13:30Z') },
          store,
          api,
        );

        expect(store.getState().activityForm).toEqual({
          ...initialState.activityForm,
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
          isFormDisabled: true,
          isTimerRunning: true,
        });
        expect(activitiesLogged.data).toEqual([
          {
            timestamp: new Date('2023-10-07T13:30Z'),
            duration: new Duration('PT30M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
          },
        ]);
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
    test('Gets working days and time summary', async () => {
      const store = createStore();
      const api = Api.createNull({
        responses: [
          {
            body: {
              workingDays: [
                {
                  date: new Date('2023-10-07T00:00Z'),
                  activities: [
                    createActivity({
                      timestamp: new Date('2023-10-07T13:00Z'),
                    }),
                    createActivity({
                      timestamp: new Date('2023-10-07T12:30Z'),
                    }),
                    createActivity({
                      timestamp: new Date('2023-10-07T12:00Z'),
                    }),
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
          },
        ],
      });

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
  });

  describe('Hours worked', () => {
    test('Summarize hours worked for clients', async () => {
      let store = createStore();
      const api = Api.createNull({
        responses: [
          {
            body: {
              clients: [
                {
                  name: 'client 1',
                  hours: 'PT1H30M',
                },
              ],
            },
          },
        ],
      });

      await getHoursWorked(store, api);

      expect(store.getState().hoursWorked).toEqual({
        clients: [
          {
            name: 'client 1',
            hours: new Duration('PT1H30M'),
          },
        ],
      });
    });
  });
});

function createStore(state = initialState) {
  return new Store(reducer, state);
}

class FakeTimer {
  start = jest.fn();
  stop = jest.fn();
}
