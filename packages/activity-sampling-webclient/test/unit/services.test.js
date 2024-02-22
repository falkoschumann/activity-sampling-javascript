import { beforeEach, describe, expect, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';

import services from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { Api } from '../../src/infrastructure/api.js';
import { Clock } from '../../src/infrastructure/clock.js';
import { Store } from '../../src/util/store.js';
import { createActivity, createActivityDto } from '../testdata.js';

describe('Services', () => {
  describe('Log activity', () => {
    describe('Logs the activity with client, project, task and optional notes', () => {
      test('Logs the activity without notes', async () => {
        const store = createStore();
        const api = Api.createNull();
        const clock = Clock.createNull({ fixed: '2023-10-07T13:30Z' });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({ name: 'client', value: 'c1' }, store);
        await services.activityUpdated({ name: 'project', value: 'p1' }, store);
        await services.activityUpdated({ name: 'task', value: 't1' }, store);
        await services.logActivity(store, api, clock);

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: '',
        });
        expect(activitiesLogged.data).toEqual([
          {
            timestamp: new Date('2023-10-07T13:30Z'),
            duration: new Duration('PT30M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: '',
          },
        ]);
      });

      test('Logs the activity with notes', async () => {
        const store = createStore();
        const api = Api.createNull();
        const clock = Clock.createNull({ fixed: '2023-10-07T13:30Z' });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({ name: 'client', value: 'c1' }, store);
        await services.activityUpdated({ name: 'project', value: 'p1' }, store);
        await services.activityUpdated({ name: 'task', value: 't1' }, store);
        await services.activityUpdated({ name: 'notes', value: 'n1' }, store);
        await services.logActivity(store, api, clock);

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
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
      const store = createStore();

      await services.activitySelected(
        { client: 'c1', project: 'p1', task: 't1', notes: 'n1' },
        store,
      );

      expect(store.getState().currentActivity).toEqual({
        ...initialState.currentActivity,
        activity: {
          ...initialState.currentActivity.activity,
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
        },
      });
    });

    describe.skip('Asks periodically what I am working on', () => {
      // TODO start countdown and disable form
      // TODO progress countdown and update remaining time
      // TODO enable form when countdown has elapsed
      // TODO disable form when activity is logged with last elapsed countdown
      // TODO stop countdown and enable form

      test('Handles notifications scheduled', async () => {
        const store = createStore({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isFormDisabled: false,
            remainingTime: new Duration('PT24M'),
            progress: 0.2,
            isTimerRunning: false,
          },
        });

        services.notificationScheduled(
          { deliverIn: new Duration('PT30M') },
          store,
        );

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          isFormDisabled: true,
          remainingTime: new Duration('PT30M'),
          progress: 0,
          isTimerRunning: true,
        });
      });

      describe('Countdown progressed', () => {
        test('Progresses countdown', async () => {
          const store = createStore({
            ...initialState,
            currentActivity: {
              ...initialState.currentActivity,
              isFormDisabled: true,
              remainingTime: new Duration('PT21M'),
              progress: 0.7,
              isTimerRunning: true,
            },
          });

          await services.countdownProgressed(
            { remaining: new Duration('PT18M') },
            store,
          );

          expect(store.getState().currentActivity).toEqual({
            ...initialState.currentActivity,
            isFormDisabled: true,
            remainingTime: new Duration('PT18M'),
            progress: 0.4,
            isTimerRunning: true,
          });
        });

        test.skip('Enables form when the countdown has elapsed', async () => {
          const store = createStore({
            ...initialState,
            currentActivity: {
              ...initialState.currentActivity,
              timestamp: undefined,
              isFormDisabled: true,
              remainingTime: new Duration('PT1M'),
              progress: 0.97,
              isTimerRunning: true,
            },
          });

          await services.countdownProgressed(
            { remaining: new Duration('PT0M') },
            store,
          );

          expect(store.getState().currentActivity).toEqual({
            ...initialState.currentActivity,
            timestamp: undefined,
            isFormDisabled: false,
            remainingTime: new Duration('PT0M'),
            progress: 1,
            isTimerRunning: true,
          });
        });
      });

      describe('Notification acknowledged', () => {
        test('Updates activity and disables form when countdown is running', async () => {
          const store = createStore({
            ...initialState,
            currentActivity: {
              ...initialState.currentActivity,
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: 'n1',
              isFormDisabled: false,
              isTimerRunning: true,
            },
          });

          await services.notificationAcknowledged(
            { client: 'c2', project: 'p2', task: 't2', notes: 'n2' },
            store,
          );

          expect(store.getState().currentActivity).toEqual({
            ...initialState.currentActivity,
            client: 'c2',
            project: 'p2',
            task: 't2',
            notes: 'n2',
            isFormDisabled: true,
            isTimerRunning: true,
          });
        });
      });

      test('Updates activity and leave form enabled when countdown is not running', async () => {
        const store = createStore({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
            isFormDisabled: false,
            isTimerRunning: false,
          },
        });

        await services.notificationAcknowledged(
          { client: 'c2', project: 'p2', task: 't2', notes: 'n2' },
          store,
        );

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          client: 'c2',
          project: 'p2',
          task: 't2',
          notes: 'n2',
          isFormDisabled: false,
          isTimerRunning: false,
        });
      });
    });

    test.todo(
      'Starts countdown with the default interval when the application starts',
    );
  });

  describe('Recent activities', () => {
    /** @type {Store} */ let store;
    /** @type {Api} */ let api;

    beforeEach(() => {
      store = createStore();
      api = Api.createNull({
        responses: {
          body: {
            workingDays: [
              {
                date: new Date('2023-10-07T00:00Z'),
                activities: [
                  createActivityDto({ timestamp: '2023-10-07T13:00Z' }),
                  createActivityDto({ timestamp: '2023-10-07T12:30Z' }),
                  createActivityDto({ timestamp: '2023-10-07T12:00Z' }),
                ],
              },
            ],
            timeSummary: {
              hoursToday: 'PT1H30M',
              hoursYesterday: 'PT0S',
              hoursThisWeek: 'PT1H30M',
              hoursThisMonth: 'PT1H30M',
            },
          },
        },
      });
    });

    test('Groups activities by working days', async () => {
      await services.selectRecentActivities(store, api);

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

    test('Summarizes houres worked today, yesterday, this week and this month', async () => {
      await services.selectRecentActivities(store, api);

      expect(store.getState().recentActivities.timeSummary).toEqual({
        hoursToday: new Duration('PT1H30M'),
        hoursYesterday: new Duration(),
        hoursThisWeek: new Duration('PT1H30M'),
        hoursThisMonth: new Duration('PT1H30M'),
      });
    });

    test('Asumes last activity as current activity', async () => {
      await services.selectRecentActivities(store, api);

      const lastActivity = createActivity({
        timestamp: new Date('2023-10-07T13:00Z'),
      });
      expect(store.getState().currentActivity).toEqual({
        ...initialState.currentActivity,
        ...lastActivity,
      });
    });

    test('Resets last activity if activity log is empty', async () => {
      const currentState = {
        ...initialState,
        currentActivity: {
          timestamp: new Date('2023-10-07T13:00Z'),
          duration: new Duration('PT20M'),
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
          isFormDisabled: true,
          remainingTime: new Duration('PT3M'),
          progress: 0.9,
          isTimerRunning: true,
        },
        recentActivities: {
          workingDays: [
            {
              date: new Date('2023-10-07T00:00Z'),
              activities: [
                createActivity({ timestamp: '2023-10-07T13:00Z' }),
                createActivity({ timestamp: '2023-10-07T12:30Z' }),
                createActivity({ timestamp: '2023-10-07T12:00Z' }),
              ],
            },
          ],
          timeSummary: {
            hoursToday: new Duration('PT1H30M'),
            hoursYesterday: new Duration('PT0S'),
            hoursThisWeek: new Duration('PT1H30M'),
            hoursThisMonth: new Duration('PT1H30M'),
          },
        },
      };
      const store = createStore(currentState);
      const api = Api.createNull({
        responses: {
          body: {
            workingDays: [],
            timeSummary: {
              hoursToday: 'PT0S',
              hoursYesterday: 'PT0S',
              hoursThisWeek: 'PT0S',
              hoursThisMonth: 'PT0S',
            },
          },
        },
      });

      await services.selectRecentActivities(store, api);

      expect(store.getState()).toEqual({
        ...currentState,
        currentActivity: {
          ...currentState.currentActivity,
          timestamp: undefined,
          client: '',
          project: '',
          task: '',
          notes: '',
        },
        recentActivities: {
          workingDays: [],
          timeSummary: {
            hoursToday: new Duration('PT0S'),
            hoursYesterday: new Duration('PT0S'),
            hoursThisWeek: new Duration('PT0S'),
            hoursThisMonth: new Duration('PT0S'),
          },
        },
      });
    });
  });

  describe('Hours worked', () => {
    test('Summarizes hours worked for clients', async () => {
      const store = createStore();
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

      await services.selectHoursWorked(store, api);

      expect(store.getState().hoursWorked).toEqual({
        clients: [
          {
            name: 'client 1',
            hours: new Duration('PT1H30M'),
          },
        ],
      });
    });

    test.todo('Summarizes hours worked on projects');
    test.todo('Summarizes hours worked on tasks');
    test.todo('Summarizes hours worked per day');
    test.todo('Summarizes hours worked per week');
    test.todo('Summarizes hours worked per month');
    test.todo('Summarizes hours worked per year');
    test.todo('Summarizes the total hours worked');
  });

  describe('Timesheet', () => {
    test.todo('Summarizes hours worked on projects per day');
    test.todo('Summarizes hours worked on projects per week');
    test.todo('Summarizes hours worked on projects per month');
    test.todo('Comparse with capacity');
    test.todo('Takes holidays into account');
    test.todo('Takes vacation into account');
  });
});

function createStore(state = initialState) {
  return new Store(reducer, state);
}
