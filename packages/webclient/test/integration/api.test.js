import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/shared';

import { Api } from '../../src/infrastructure/api.js';
import { createActivity, createActivityDto } from '../testdata.js';

describe('API', () => {
  test('Logs activity', async () => {
    const api = Api.createNull();
    const activitiesLogged = api.trackActivitiesLogged();

    await api.logActivity(createActivity());

    expect(activitiesLogged.data).toEqual([createActivity()]);
  });

  test('Loads recent activities', async () => {
    const api = Api.createNull({
      response: {
        body: {
          workingDays: [
            {
              date: new Date('2023-10-07T00:00Z'),
              activities: [
                createActivityDto({ timestamp: '2024-03-07T18:00Z' }),
                createActivityDto({ timestamp: '2024-03-07T17:30Z' }),
              ],
            },
          ],
          timeSummary: {
            hoursToday: 'PT1H',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT1H',
            hoursThisMonth: 'PT1H',
          },
        },
      },
    });

    const activities = await api.loadRecentActivities();

    expect(activities).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00Z'),
          activities: [
            createActivity({ timestamp: new Date('2024-03-07T18:00Z') }),
            createActivity({ timestamp: new Date('2024-03-07T17:30Z') }),
          ],
        },
      ],
      timeSummary: {
        hoursToday: new Duration('PT1H'),
        hoursYesterday: new Duration(),
        hoursThisWeek: new Duration('PT1H'),
        hoursThisMonth: new Duration('PT1H'),
      },
    });
  });
});
