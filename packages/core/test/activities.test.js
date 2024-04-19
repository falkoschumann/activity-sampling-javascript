import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/shared';

import { Activity, RecentActivities } from '../src/activities.js';

describe('Activities', () => {
  describe('Recent activities', () => {
    describe('Working days', () => {
      test('Returns empty list', () => {
        const result = RecentActivities.create();

        expect(result.workingDays).toEqual([]);
      });

      test('Returns one day with one activity', () => {
        const activity = Activity.createNull({
          timestamp: new Date('2024-04-04T10:00Z'),
        });

        const result = RecentActivities.create({ activities: [activity] });

        expect(result.workingDays).toEqual([
          { date: new Date('2024-04-04T00:00'), activities: [activity] },
        ]);
      });

      test('Returns multiple activities on same day sorted by time descending', () => {
        const activity1 = Activity.createNull({
          timestamp: new Date('2023-10-07T10:00Z'),
        });
        const activity2 = Activity.createNull({
          timestamp: new Date('2023-10-07T10:30Z'),
        });
        const activity3 = Activity.createNull({
          timestamp: new Date('2023-10-07T11:00Z'),
        });

        const result = RecentActivities.create({
          activities: [activity1, activity2, activity3],
          today: new Date('2023-10-07T14:00Z'),
        });

        expect(result.workingDays).toEqual([
          {
            date: new Date('2023-10-07T00:00'),
            activities: [activity3, activity2, activity1],
          },
        ]);
      });

      test('Returns activities on multiple days sorted by date descending', () => {
        const activity1 = Activity.createNull({
          timestamp: new Date('2023-10-06T10:00Z'),
        });
        const activity2 = Activity.createNull({
          timestamp: new Date('2023-10-07T10:00Z'),
        });
        const activity3 = Activity.createNull({
          timestamp: new Date('2023-10-08T10:00Z'),
        });

        let result = RecentActivities.create({
          activities: [activity1, activity2, activity3],
          today: new Date('2023-10-08T14:00Z'),
        });

        expect(result.workingDays).toEqual([
          {
            date: new Date('2023-10-08T00:00'),
            activities: [activity3],
          },
          {
            date: new Date('2023-10-07T00:00'),
            activities: [activity2],
          },
          {
            date: new Date('2023-10-06T00:00'),
            activities: [activity1],
          },
        ]);
      });

      test('Ignores activities older than 30 days', () => {
        const activity1 = Activity.createNull({
          timestamp: new Date('2024-03-04T10:00Z'),
        });
        const activity2 = Activity.createNull({
          timestamp: new Date('2024-03-05T10:00Z'),
        });
        const activity3 = Activity.createNull({
          timestamp: new Date('2024-04-04T10:00Z'),
        });

        const result = RecentActivities.create({
          activities: [activity1, activity2, activity3],
          today: new Date('2024-04-04T14:00Z'),
        });

        expect(result.workingDays).toEqual([
          {
            date: new Date('2024-04-04T00:00'),
            activities: [activity3],
          },
          {
            date: new Date('2024-03-05T00:00'),
            activities: [activity2],
          },
        ]);
      });
    });

    describe('Time summary', () => {
      test('Returns zero hours', () => {
        const result = RecentActivities.create();

        expect(result.timeSummary).toEqual({
          hoursToday: Duration.zero(),
          hoursYesterday: Duration.zero(),
          hoursThisWeek: Duration.zero(),
          hoursThisMonth: Duration.zero(),
        });
      });

      test('Sums hours today', () => {
        let result = RecentActivities.create({
          activities: [
            Activity.createNull({
              timestamp: new Date('2023-10-06T12:00'), // yesterday
              duration: new Duration('PT15M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-07T12:00'), // today
              duration: new Duration('PT20M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-07T12:30'), // today
              duration: new Duration('PT30M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-08T12:00'), // tomorrow
              duration: new Duration('PT60M'),
            }),
          ],
          today: new Date('2023-10-07T00:00'),
        });

        expect(result.timeSummary).toEqual({
          hoursToday: new Duration('PT50M'),
          hoursYesterday: new Duration('PT15M'),
          hoursThisWeek: new Duration('PT1H5M'),
          hoursThisMonth: new Duration('PT1H5M'),
        });
      });

      test('Sums hours yesterday', () => {
        let result = RecentActivities.create({
          activities: [
            Activity.createNull({
              timestamp: new Date('2023-10-06T12:00'), // the day before yesterday
              duration: new Duration('PT15M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-07T12:00'), // yesterday
              duration: new Duration('PT20M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-07T12:30'), // yesterday
              duration: new Duration('PT30M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-08T12:00'), // today
              duration: new Duration('PT60M'),
            }),
          ],
          today: new Date('2023-10-08T00:00'),
        });

        expect(result.timeSummary).toEqual({
          hoursToday: new Duration('PT60M'),
          hoursYesterday: new Duration('PT50M'),
          hoursThisWeek: new Duration('PT2H5M'),
          hoursThisMonth: new Duration('PT2H5M'),
        });
      });

      test('Sums hours this week on a sunday', () => {
        let result = RecentActivities.create({
          activities: [
            Activity.createNull({
              timestamp: new Date('2023-10-08T12:00'), // sunday last week
              duration: new Duration('PT15M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-09T12:00'), // monday this week
              duration: new Duration('PT20M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-15T12:00'), // sunday this week
              duration: new Duration('PT30M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-16T12:00'), // monday next week
              duration: new Duration('PT60M'),
            }),
          ],
          today: new Date('2023-10-15T00:00'),
        });

        expect(result.timeSummary).toEqual({
          hoursToday: new Duration('PT30M'),
          hoursYesterday: Duration.zero(),
          hoursThisWeek: new Duration('PT50M'),
          hoursThisMonth: new Duration('PT1H5M'),
        });
      });

      test('Sums hours this week on a monday', () => {
        let result = RecentActivities.create({
          activities: [
            Activity.createNull({
              timestamp: new Date('2023-10-09T12:00'), // monday last week
              duration: new Duration('PT15M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-15T12:00'), // sunday this week
              duration: new Duration('PT20M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-16T12:00'), // monday this week
              duration: new Duration('PT30M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-17T12:00'), // tomorrow this week
              duration: new Duration('PT60M'),
            }),
          ],
          today: new Date('2023-10-16T00:00'),
        });

        expect(result.timeSummary).toEqual({
          hoursToday: new Duration('PT30M'),
          hoursYesterday: new Duration('PT20M'),
          hoursThisWeek: new Duration('PT30M'),
          hoursThisMonth: new Duration('PT1H5M'),
        });
      });

      test('Sums hours this month', () => {
        let result = RecentActivities.create({
          activities: [
            Activity.createNull({
              timestamp: new Date('2023-09-30T12:00'), // last day last month
              duration: new Duration('PT15M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-01T12:00'), // first day this month
              duration: new Duration('PT20M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-10-31T12:00'), // last day this month
              duration: new Duration('PT30M'),
            }),
            Activity.createNull({
              timestamp: new Date('2023-11-01T12:00'), // first day next month
              duration: new Duration('PT60M'),
            }),
          ],
          today: new Date('2023-10-31T00:00'),
        });

        expect(result.timeSummary).toEqual({
          hoursToday: new Duration('PT30M'),
          hoursYesterday: Duration.zero(),
          hoursThisWeek: new Duration('PT30M'),
          hoursThisMonth: new Duration('PT50M'),
        });
      });
    });
  });
});
