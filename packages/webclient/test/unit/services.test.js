import { describe, expect, test } from '@jest/globals';

import { Clock, Duration, Timer } from '@activity-sampling/utils';

import { Activity } from '@activity-sampling/domain';
import { Services } from '../../src/application/services.js';
import { initialState } from '../../src/domain/reducer.js';
import { Api } from '../../src/infrastructure/api.js';

describe('Services', () => {
  describe('Activity updated', () => {
    test('Updates a single property', async () => {
      const { services } = configure({
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
          },
        },
      });

      await services.activityUpdated({ client: 'c2' });

      expect(services.store.getState()).toEqual({
        ...initialState,
        currentActivity: {
          ...initialState.currentActivity,
          activity: {
            timestamp: undefined,
            duration: new Duration('PT30M'),
            client: 'c2',
            project: 'p1',
            task: 't1',
            notes: 'n1',
          },
          isSubmitDisabled: false,
        },
      });
    });

    test('Updates all properties', async () => {
      const { services } = configure();

      await services.activityUpdated({
        client: 'c1',
        project: 'p1',
        task: 't1',
        notes: 'n1',
      });

      expect(services.store.getState()).toEqual({
        ...initialState,
        currentActivity: {
          ...initialState.currentActivity,
          activity: {
            timestamp: undefined,
            duration: new Duration('PT30M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: 'n1',
          },
          isSubmitDisabled: false,
        },
      });
    });

    test('Enables submit if all required properties are set', async () => {
      const { services } = configure();

      await services.activityUpdated({
        client: 'c1',
        project: 'p1',
        task: 't1',
      });

      expect(services.store.getState()).toEqual({
        ...initialState,
        currentActivity: {
          ...initialState.currentActivity,
          activity: {
            timestamp: undefined,
            duration: new Duration('PT30M'),
            client: 'c1',
            project: 'p1',
            task: 't1',
            notes: '',
          },
          isSubmitDisabled: false,
        },
      });
    });

    test('Disables submit unless all required properties are set', async () => {
      const { services } = configure();

      await services.activityUpdated({ client: 'c1' });

      expect(services.store.getState()).toEqual({
        ...initialState,
        currentActivity: {
          ...initialState.currentActivity,
          activity: {
            timestamp: undefined,
            duration: new Duration('PT30M'),
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

  describe('Log activity', () => {
    describe('Logs the activity with client, project, task and optional notes', () => {
      test('Logs the activity without notes', async () => {
        const { services, api } = configure({ now: '2023-10-07T13:30Z' });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
        });
        await services.logActivity();

        expect(services.store.getState()).toEqual({
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
        const { services, api } = configure({ now: '2023-10-07T13:30Z' });
        const activitiesLogged = api.trackActivitiesLogged();

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
          notes: 'n1',
        });
        await services.logActivity();

        expect(services.store.getState()).toEqual({
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

    describe('Recent activities', () => {
      test('Returns recent activities', async () => {
        const { services } = configure({
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

        expect(services.store.getState()).toEqual({
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
        const state = {
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
        };
        const { services } = configure({
          state,
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

        expect(services.store.getState()).toEqual({
          ...state,
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

    describe('Asks periodically what I am working on', () => {
      test('Starts countdown and disable form', () => {
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        const scheduledTasks = timer.trackScheduledTasks();

        services.askPeriodically({ period: new Duration('PT20M') });

        expect(services.store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
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
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        services.askPeriodically({ period: new Duration('PT1M') });

        timer.simulateTaskExecution({ times: 1 });

        expect(services.store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Progresses countdown until end of the period', () => {
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        services.askPeriodically({ period: new Duration('PT1M') });

        timer.simulateTaskExecution({ times: 59 });

        expect(services.store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isSubmitDisabled: true,
            isFormDisabled: true,
          },
          countdown: {
            isRunning: true,
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT1S'),
          },
        });
      });

      test('Enables form when countdown has elapsed', () => {
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        services.askPeriodically({ period: new Duration('PT1M') });

        timer.simulateTaskExecution({ times: 60 });

        expect(services.store.getState()).toEqual({
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
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT0S'),
          },
        });
      });

      test('Restarts the countdown when the period has expired', () => {
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        services.askPeriodically({ period: new Duration('PT1M') });

        timer.simulateTaskExecution({ times: 61 });

        expect(services.store.getState()).toEqual({
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
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Disables form when activity is logged with last elapsed countdown', async () => {
        const { services, api, timer, clock } = configure({
          now: '2024-03-03T16:53Z',
        });
        const activitiesLogged = api.trackActivitiesLogged();
        services.askPeriodically({ period: new Duration('PT1M') });
        timer.simulateTaskExecution({ times: 61 });

        await services.activityUpdated({
          client: 'c1',
          project: 'p1',
          task: 't1',
        });
        clock.add(new Duration('PT3M'));
        await services.logActivity();

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
        expect(services.store.getState()).toEqual({
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
            period: new Duration('PT1M'),
            remainingTime: new Duration('PT59S'),
          },
        });
      });

      test('Stops countdown and enable form', async () => {
        const { services, timer } = configure({ now: '2024-03-03T16:53Z' });
        const canceled = timer.trackCanceledTasks();
        services.askPeriodically({ period: new Duration('PT1M') });
        timer.simulateTaskExecution({ times: 20 });

        await services.stopAskingPeriodically();

        expect(canceled.data).toHaveLength(1);
        expect(services.store.getState()).toEqual({
          ...initialState,
          currentActivity: {
            ...initialState.currentActivity,
            isFormDisabled: false,
          },
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
  const timer = Timer.createNull();
  const clock = Clock.createNull({ fixed: now });
  const services = new Services(state, api, timer, clock);
  return { services, api, timer, clock };
}
