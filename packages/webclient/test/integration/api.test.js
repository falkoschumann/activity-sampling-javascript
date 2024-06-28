import { describe, expect, test } from '@jest/globals';

import { Activity, RecentActivities } from '@activity-sampling/domain';
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
      response: { body: RecentActivities.createTestInstance() },
    });

    const activities = await api.selectRecentActivities();

    expect(activities).toEqual(RecentActivities.createTestInstance());
  });
});
