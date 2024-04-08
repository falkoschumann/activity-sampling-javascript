import { beforeEach, describe, expect, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';

import * as services from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { ActivitiesGateway } from '../../src/infrastructure/activities-gateway.js';
import { Clock } from '../../src/infrastructure/clock.js';
import { Store } from '../../src/util/store.js';
import { createActivity, createActivityDto } from '../testdata.js';
import { Timer } from '../../src/infrastructure/timer.js';

describe('Services', () => {
  describe('Log activity', () => {
    describe('Logs the activity with client, project, task and optional notes', () => {
      test('Logs the activity without notes', async () => {
        const store = createStore();
        const gateway = ActivitiesGateway.createNull();
        const clock = Clock.createNull({ fixed: '2023-10-07T13:30Z' });
        const activitiesLogged = gateway.trackActivitiesLogged();

        await services.activityUpdated({ name: 'client', value: 'c1' }, store);
        await services.activityUpdated({ name: 'project', value: 'p1' }, store);
        await services.activityUpdated({ name: 'task', value: 't1' }, store);
        await services.logActivity(store, gateway, clock);

        expect(store.getState().currentActivity.activity).toEqual({
          timestamp: new Date('2023-10-07T13:30Z'),
          duration: new Duration('PT30M'),
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
        const gateway = ActivitiesGateway.createNull();
        const clock = Clock.createNull({ fixed: '2023-10-07T13:30Z' });
        const activitiesLogged = gateway.trackActivitiesLogged();

        await services.activityUpdated({ name: 'client', value: 'c1' }, store);
        await services.activityUpdated({ name: 'project', value: 'p1' }, store);
        await services.activityUpdated({ name: 'task', value: 't1' }, store);
        await services.activityUpdated({ name: 'notes', value: 'n1' }, store);
        await services.logActivity(store, gateway, clock);

        expect(store.getState().currentActivity.activity).toEqual({
          timestamp: new Date('2023-10-07T13:30Z'),
          duration: new Duration('PT30M'),
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

    describe('Asks periodically what I am working on', () => {
      test('Starts countdown and disable form', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        const scheduledTasks = timer.trackScheduledTasks();

        services.askPeriodically(
          { period: new Duration('PT20M') },
          store,
          timer,
          clock,
        );

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          isFormDisabled: true,
          countdown: {
            isRunning: true,
            period: new Duration('PT20M'),
            remainingTime: new Duration('PT20M'),
          },
        });
        expect(scheduledTasks.data).toEqual([
          { task: expect.any(Function), period: 1000 },
        ]);
      });

      test('Progresses countdown and update remaining time', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock,
        );

        timer.simulateTaskExecution({ times: 1 });

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          isFormDisabled: true,
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Progresses countdown until end of the period', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock,
        );

        timer.simulateTaskExecution({ times: 59 });

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          isFormDisabled: true,
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT1S'),
          },
        });
      });

      test('Enables form when countdown has elapsed', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock,
        );

        timer.simulateTaskExecution({ times: 60 });

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          activity: {
            ...initialState.currentActivity.activity,
            timestamp: new Date('2024-03-03T16:53Z'),
            duration: new Duration('PT1M'),
          },
          isFormDisabled: false,
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT0S'),
          },
        });
      });

      test('Restarts the countdown when the period has expired', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock,
        );

        timer.simulateTaskExecution({ times: 61 });

        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          activity: {
            ...initialState.currentActivity.activity,
            timestamp: new Date('2024-03-03T16:53Z'),
            duration: new Duration('PT1M'),
          },
          isFormDisabled: false,
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Disables form when activity is logged with last elapsed countdown', async () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock1 = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        const clock2 = Clock.createNull({ fixed: '2024-03-03T16:56Z' });
        const gateway = ActivitiesGateway.createNull();
        const activitiesLogged = gateway.trackActivitiesLogged();
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock1,
        );
        timer.simulateTaskExecution({ times: 61 });

        await services.activityUpdated({ name: 'client', value: 'c1' }, store);
        await services.activityUpdated({ name: 'project', value: 'p1' }, store);
        await services.activityUpdated({ name: 'task', value: 't1' }, store);
        await services.logActivity(store, gateway, clock2);

        expect(activitiesLogged.data).toEqual([
          {
            timestamp: new Date('2024-03-03T16:53Z'),
            duration: new Duration('PT1M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: '',
          },
        ]);
        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          activity: {
            timestamp: new Date('2024-03-03T16:53Z'),
            duration: new Duration('PT1M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: '',
          },
          isFormDisabled: true,
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Stops countdown and enable form', () => {
        const store = createStore();
        const timer = Timer.createNull();
        const clock = Clock.createNull({ fixed: '2024-03-03T16:53Z' });
        const canceled = timer.trackCanceledTasks();
        services.askPeriodically(
          { period: new Duration('PT1M') },
          store,
          timer,
          clock,
        );
        timer.simulateTaskExecution({ times: 20 });

        services.stopAskingPeriodically(store, timer);

        expect(canceled.data).toHaveLength(1);
        expect(store.getState().currentActivity).toEqual({
          ...initialState.currentActivity,
          isFormDisabled: false,
          countdown: {
            isRunning: false,
            period: new Duration('PT1M'),
            remainingTime: Duration.zero(),
          },
        });
      });
    });

    test.todo(
      'Starts countdown with the default interval when the application starts',
    );
  });

  describe('Recent activities', () => {
    /** @type {Store} */ let store;
    /** @type {ActivitiesGateway} */ let gateway;

    beforeEach(() => {
      store = createStore();
      gateway = ActivitiesGateway.createNull({
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
      await services.selectRecentActivities(store, gateway);

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
      await services.selectRecentActivities(store, gateway);

      expect(store.getState().recentActivities.timeSummary).toEqual({
        hoursToday: new Duration('PT1H30M'),
        hoursYesterday: new Duration(),
        hoursThisWeek: new Duration('PT1H30M'),
        hoursThisMonth: new Duration('PT1H30M'),
      });
    });

    test('Asumes last activity as current activity', async () => {
      await services.selectRecentActivities(store, gateway);

      const lastActivity = createActivity({
        timestamp: new Date('2023-10-07T13:00Z'),
      });
      expect(store.getState().currentActivity).toEqual({
        ...initialState.currentActivity,
        activity: lastActivity,
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
      const gateway = ActivitiesGateway.createNull({
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

      await services.selectRecentActivities(store, gateway);

      expect(store.getState()).toEqual({
        ...currentState,
        currentActivity: {
          ...currentState.currentActivity,
          activity: {
            timestamp: undefined,
            client: '',
            project: '',
            task: '',
            notes: '',
          },
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
    test.todo('Summarizes hours worked for clients');
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

function createStore(state) {
  return new Store(reducer, state);
}
