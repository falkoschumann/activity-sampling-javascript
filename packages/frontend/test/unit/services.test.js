/**
 * @jest-environment jsdom
 */

import { describe, expect, test } from '@jest/globals';

import { Clock, createStore, Duration, Timer } from '@muspellheim/utils';
import { Activity } from '@activity-sampling/domain';

import { Services } from '../../src/application/services.js';
import { initialState, reducer } from '../../src/domain/reducer.js';
import { Api } from '../../src/infrastructure/api.js';
import { NotificationAdapter } from '../../src/infrastructure/notification-adapter.js';

describe('Services', () => {
  describe('Log activity', () => {
    describe('Activity updated', () => {
      test('Selects an activity from recent activities.', async () => {
        const { services, store } = configure();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
        });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: 'n1',
            },
            isSubmitDisabled: false,
          },
        });
      });

      test('Updates a single property', async () => {
        const { services, store } = configure({
          state: {
            ...initialState,
            currentActivity: {
              ...initialState.currentActivity,
              activity: {
                ...initialState.currentActivity.activity,
                client: 'c1',
                project: 'p1',
                task: 't1',
                notes: 'n1',
              },
              isSubmitDisabled: false,
            },
          },
        });

        await services.activityUpdated({ client: 'c2' });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              client: 'c2',
              project: 'p1',
              task: 't1',
              notes: 'n1',
            },
            isSubmitDisabled: false,
          },
        });
      });

      test('Enables submit if all required properties are set', async () => {
        const { services, store } = configure();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
        });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: '',
            },
            isSubmitDisabled: false,
          },
        });
      });

      test('Disables submit if not all required properties are set', async () => {
        const { services, store } = configure();

        await services.activityUpdated({ client: 'c1' });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              client: 'c1',
              project: '',
              task: '',
              notes: '',
            },
            isSubmitDisabled: true,
          },
        });
      });
    });

    describe('Logs the activity with client, project, task and optional notes', () => {
      test('Logs the activity without notes', async () => {
        const { services, store, api } = configure({
          now: '2023-10-07T13:30Z',
        });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
        });
        await services.logActivity();

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              timestamp: new Date('2023-10-07T13:30Z'),
              duration: new Duration('PT30M'),
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: '',
            },
            isSubmitDisabled: false,
          },
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
        const { services, store, api } = configure({
          now: '2023-10-07T13:30Z',
        });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
        });
        await services.logActivity();

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              timestamp: new Date('2023-10-07T13:30Z'),
              duration: new Duration('PT30M'),
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: 'n1',
            },
            isSubmitDisabled: false,
          },
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

    describe('Asks periodically what I am working on', () => {
      test('Starts countdown and disable form', async () => {
        const { services, store, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        const scheduledTasks = timer.trackScheduledTasks();

        await services.askPeriodically({ period: new Duration('PT20M') });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            isElapsed: false,
            period: new Duration('PT20M'),
            remainingTime: new Duration('PT20M'),
          },
        });
        expect(scheduledTasks.data).toEqual([
          { task: expect.any(Function), period: 1000 },
        ]);
      });

      test('Progresses countdown and update remaining time', async () => {
        const { services, store, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        await services.askPeriodically({ period: new Duration('PT1M') });

        await timer.simulateTaskExecution({ times: 1 });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            isElapsed: false,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Progresses countdown until end of the period', async () => {
        const { services, store, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        await services.askPeriodically({ period: new Duration('PT1M') });

        await timer.simulateTaskExecution({ times: 59 });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            isElapsed: false,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT1S'),
          },
        });
      });

      test('Enables form when countdown is elapsed', async () => {
        const { services, store, notificationAdapter, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        await services.askPeriodically({ period: new Duration('PT1M') });
        const shown = notificationAdapter.trackShow();

        await timer.simulateTaskExecution({ times: 60 });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              timestamp: new Date('2024-03-03T16:53Z'),
              duration: new Duration('PT1M'),
            },
            isSubmitDisabled: true,
            isFormDisabled: false,
          },
          countdown: {
            isRunning: true,
            isElapsed: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT0S'),
          },
        });
        expect(shown.data).toEqual([{ title: 'What are you working on?' }]);
      });

      test('Restarts the countdown when the countdown is elapsed', async () => {
        const { services, store, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        await services.askPeriodically({ period: new Duration('PT1M') });

        await timer.simulateTaskExecution({ times: 61 });

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              ...initialState.currentActivity.activity,
              timestamp: new Date('2024-03-03T16:53Z'),
              duration: new Duration('PT1M'),
            },
            isFormDisabled: false,
          },
          countdown: {
            isRunning: true,
            isElapsed: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Disables form when activity is logged with last elapsed countdown', async () => {
        const { services, store, api, notificationAdapter, timer, clock } =
          configure({
            now: '2024-03-03T16:53Z',
          });
        const activitiesLogged = api.trackActivitiesLogged();
        await services.askPeriodically({ period: new Duration('PT1M') });
        await timer.simulateTaskExecution({ times: 61 });
        const closed = notificationAdapter.trackClose();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
        });
        clock.add(new Duration('PT3M'));
        await services.logActivity();

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              timestamp: new Date('2024-03-03T16:56Z'),
              duration: new Duration('PT1M'),
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: '',
            },
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            isElapsed: false,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
        expect(activitiesLogged.data).toEqual([
          {
            timestamp: new Date('2024-03-03T16:56Z'),
            duration: new Duration('PT1M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: '',
          },
        ]);
        expect(closed.data).toEqual([{ title: 'What are you working on?' }]);
      });

      test('Enables form if countdown is stopped', async () => {
        const { services, store, timer } = configure({
          now: '2024-03-03T16:53Z',
        });
        const canceled = timer.trackCanceledTasks();
        await services.askPeriodically({ period: new Duration('PT1M') });
        await timer.simulateTaskExecution({ times: 20 });

        await services.stopAskingPeriodically();

        expect(store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isFormDisabled: false,
          },
          countdown: {
            isRunning: false,
            isElapsed: false,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT40S'),
          },
        });
        expect(canceled.data).toHaveLength(1);
      });
    });

    test.todo(
      'Starts countdown with the default interval when the application starts',
    );
  });

  describe('Recent activities', () => {
    test('Assumes last activity as current activity.', async () => {
      const { services, store } = configure({
        response: {
          body: {
            workingDays: [
              {
                date: new Date('2023-10-07T00:00Z'),
                activities: [
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T13:00Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:30Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:00Z',
                  }),
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

      await services.selectRecentActivities();

      expect(store.getState()).toEqual({
        ...initialState,
        currentActivity: {
          ...initialState.currentActivity,
          activity: Activity.createTestInstance({
            timestamp: new Date('2023-10-07T13:00Z'),
          }),
          isSubmitDisabled: false,
          isFormDisabled: false,
        },
        recentActivities: {
          workingDays: [
            {
              date: new Date('2023-10-07T00:00Z'),
              activities: [
                Activity.createTestInstance({
                  timestamp: new Date('2023-10-07T13:00Z'),
                }),
                Activity.createTestInstance({
                  timestamp: new Date('2023-10-07T12:30Z'),
                }),
                Activity.createTestInstance({
                  timestamp: new Date('2023-10-07T12:00Z'),
                }),
              ],
            },
          ],
          timeSummary: {
            hoursToday: new Duration('PT1H30M'),
            hoursYesterday: new Duration(),
            hoursThisWeek: new Duration('PT1H30M'),
            hoursThisMonth: new Duration('PT1H30M'),
          },
        },
      });
    });

    test('Resets if activity log is empty', async () => {
      const { services, store } = configure({
        state: {
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              timestamp: new Date('2023-10-07T13:00Z'),
              duration: new Duration('PT20M'),
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: 'n1',
            },
          },
          recentActivities: {
            workingDays: [
              {
                date: new Date('2023-10-07T00:00Z'),
                activities: [
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T13:00Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:30Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:00Z',
                  }),
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
        },
        response: {
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

      await services.selectRecentActivities();

      expect(store.getState()).toEqual({
        ...{
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            activity: {
              timestamp: new Date('2023-10-07T13:00Z'),
              duration: new Duration('PT20M'),
              client: 'c1',
              project: 'p1',
              task: 't1',
              notes: 'n1',
            },
          },
          recentActivities: {
            workingDays: [
              {
                date: new Date('2023-10-07T00:00Z'),
                activities: [
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T13:00Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:30Z',
                  }),
                  Activity.createTestInstance({
                    timestamp: '2023-10-07T12:00Z',
                  }),
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
        },
        currentActivity: {
          ...initialState.currentActivity,
          activity: {
            timestamp: undefined,
            duration: new Duration('PT30M'),
            client: '',
            project: '',
            task: '',
            notes: '',
          },
          isSubmitDisabled: true,
          isFormDisabled: false,
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

function configure({ state, response, now } = {}) {
  const api = Api.createNull({ response });
  const notificationAdapter = NotificationAdapter.createNull();
  const timer = Timer.createNull();
  const clock = Clock.createNull({ fixed: now });
  const store = createStore(reducer, state);
  const services = new Services(store, api, notificationAdapter, timer, clock);
  return { services, store, api, notificationAdapter, timer, clock };
}
