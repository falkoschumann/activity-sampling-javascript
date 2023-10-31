import { describe, expect, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';
import 'activity-sampling-shared/tests/equality-testers.js';

import { createRecentActivities } from '../../src/domain/recent-activities.js';

import { createActivity } from '../testdata.js';

describe('working days', () => {
  test('returns multiple activities on same day sorted by time descending', () => {
    let result = createRecentActivities([
      createActivity({ timestamp: new Date('2023-10-07T10:00Z') }),
      createActivity({ timestamp: new Date('2023-10-07T10:30Z') }),
      createActivity({ timestamp: new Date('2023-10-07T11:00Z') }),
    ]);

    expect(result.workingDays).toEqual([
      {
        date: new Date('2023-10-07T00:00'),
        activities: [
          createActivity({ timestamp: new Date('2023-10-07T11:00Z') }),
          createActivity({ timestamp: new Date('2023-10-07T10:30Z') }),
          createActivity({ timestamp: new Date('2023-10-07T10:00Z') }),
        ],
      },
    ]);
  });

  test('returns activities on multiple days sorted by date descending', () => {
    let result = createRecentActivities([
      createActivity({ timestamp: new Date('2023-10-06T10:00Z') }),
      createActivity({ timestamp: new Date('2023-10-07T10:00Z') }),
      createActivity({ timestamp: new Date('2023-10-08T10:00Z') }),
    ]);

    expect(result.workingDays).toEqual([
      {
        date: new Date('2023-10-08T00:00'),
        activities: [
          createActivity({ timestamp: new Date('2023-10-08T10:00Z') }),
        ],
      },
      {
        date: new Date('2023-10-07T00:00'),
        activities: [
          createActivity({ timestamp: new Date('2023-10-07T10:00Z') }),
        ],
      },
      {
        date: new Date('2023-10-06T00:00'),
        activities: [
          createActivity({ timestamp: new Date('2023-10-06T10:00Z') }),
        ],
      },
    ]);
  });
});

describe('time summary', () => {
  test('sums hours today', () => {
    let result = createRecentActivities(
      [
        createActivity({
          timestamp: new Date('2023-10-06T12:00'), // yesterday
          duration: new Duration('PT15M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:00'), // today
          duration: new Duration('PT20M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30'), // today
          duration: new Duration('PT30M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-08T12:00'), // tomorrow
          duration: new Duration('PT60M'),
        }),
      ],
      new Date('2023-10-07T00:00'),
    );

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT50M'),
      hoursYesterday: new Duration('PT15M'),
      hoursThisWeek: new Duration('PT1H5M'),
      hoursThisMonth: new Duration('PT1H5M'),
    });
  });

  test('sums hours yesterday', () => {
    let result = createRecentActivities(
      [
        createActivity({
          timestamp: new Date('2023-10-06T12:00'), // the day before yesterday
          duration: new Duration('PT15M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:00'), // yesterday
          duration: new Duration('PT20M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-07T12:30'), // yesterday
          duration: new Duration('PT30M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-08T12:00'), // today
          duration: new Duration('PT60M'),
        }),
      ],
      new Date('2023-10-08T00:00'),
    );

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT60M'),
      hoursYesterday: new Duration('PT50M'),
      hoursThisWeek: new Duration('PT2H5M'),
      hoursThisMonth: new Duration('PT2H5M'),
    });
  });

  test('sums hours this week on a sunday', () => {
    let result = createRecentActivities(
      [
        createActivity({
          timestamp: new Date('2023-10-08T12:00'), // sunday last week
          duration: new Duration('PT15M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-09T12:00'), // monday this week
          duration: new Duration('PT20M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-15T12:00'), // sunday this week
          duration: new Duration('PT30M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-16T12:00'), // monday next week
          duration: new Duration('PT60M'),
        }),
      ],
      new Date('2023-10-15T00:00'),
    );

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT30M'),
      hoursYesterday: Duration.ZERO,
      hoursThisWeek: new Duration('PT50M'),
      hoursThisMonth: new Duration('PT1H5M'),
    });
  });

  test('sums hours this week on a monday', () => {
    let result = createRecentActivities(
      [
        createActivity({
          timestamp: new Date('2023-10-09T12:00'), // monday last week
          duration: new Duration('PT15M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-15T12:00'), // sunday this week
          duration: new Duration('PT20M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-16T12:00'), // monday this week
          duration: new Duration('PT30M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-17T12:00'), // tomorrow this week
          duration: new Duration('PT60M'),
        }),
      ],
      new Date('2023-10-16T00:00'),
    );

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT30M'),
      hoursYesterday: new Duration('PT20M'),
      hoursThisWeek: new Duration('PT30M'),
      hoursThisMonth: new Duration('PT1H5M'),
    });
  });

  test('sums hours this month', () => {
    let result = createRecentActivities(
      [
        createActivity({
          timestamp: new Date('2023-09-30T12:00'), // last day last month
          duration: new Duration('PT15M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-01T12:00'), // first day this month
          duration: new Duration('PT20M'),
        }),
        createActivity({
          timestamp: new Date('2023-10-31T12:00'), // last day this month
          duration: new Duration('PT30M'),
        }),
        createActivity({
          timestamp: new Date('2023-11-01T12:00'), // first day next month
          duration: new Duration('PT60M'),
        }),
      ],
      new Date('2023-10-31T00:00'),
    );

    expect(result.timeSummary).toEqual({
      hoursToday: new Duration('PT30M'),
      hoursYesterday: Duration.ZERO,
      hoursThisWeek: new Duration('PT30M'),
      hoursThisMonth: new Duration('PT50M'),
    });
  });
});
