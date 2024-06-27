import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/shared';
import { Activity } from '@activity-sampling/domain';
import { Api } from '../../src/infrastructure/api.js';

describe('API', () => {
  test('Logs activity', async () => {
    const api = Api.createNull();
    const activitiesLogged = api.trackActivitiesLogged();

    await api.logActivity(Activity.createTestInstance());

    expect(activitiesLogged.data).toEqual([Activity.createTestInstance()]);
  });

  test('Loads recent activities', async () => {
    const api = Api.createNull({
      response: {
        body: {
          workingDays: [
            {
              date: new Date('2023-10-07T00:00Z'),
              activities: [
                Activity.createTestInstance({ timestamp: '2024-03-07T18:00Z' }),
                Activity.createTestInstance({ timestamp: '2024-03-07T17:30Z' }),
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

    const activities = await api.selectRecentActivities();

    expect(activities).toEqual({
      workingDays: [
        {
          date: new Date('2023-10-07T00:00Z'),
          activities: [
            Activity.createTestInstance({
              timestamp: new Date('2024-03-07T18:00Z'),
            }),
            Activity.createTestInstance({
              timestamp: new Date('2024-03-07T17:30Z'),
            }),
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
