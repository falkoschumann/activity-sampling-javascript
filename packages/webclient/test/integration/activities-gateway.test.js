import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/shared';

import { ActivitiesGateway } from '../../src/infrastructure/activities-gateway.js';
import { createActivity, createActivityDto } from '../testdata.js';

describe('Activities gateway', () => {
  test('Loads recent activities', async () => {
    const gateway = ActivitiesGateway.createNull({
      responses: {
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

    const activities = await gateway.loadRecentActivities();

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

  test('Logs activity', async () => {
    const gateway = ActivitiesGateway.createNull();
    const activitiesLogged = gateway.trackActivitiesLogged();

    await gateway.logActivity(createActivity());

    expect(activitiesLogged.data).toEqual([createActivity()]);
  });
});
