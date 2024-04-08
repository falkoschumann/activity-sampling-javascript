import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { Duration } from 'activity-sampling-shared';

import { Activity, LogActivity } from '../../src/domain/activities.js';
import { Repository } from '../../src/infrastructure/repository.js';
import { ActivitySamplingApp } from '../../src/ui/activity-sampling-app.js';

describe('API', () => {
  const fileName = fileURLToPath(
    new URL('../../data/activity-log.test.csv', import.meta.url),
  );
  /** @type {Repository} */ let repository;
  let app;

  beforeEach(() => {
    rmSync(fileName, { force: true });
    repository = Repository.create({ fileName });
    app = new ActivitySamplingApp({ repository }).app;
  });

  describe('Log activity', () => {
    test('Runs happy path', async () => {
      const logActivity = LogActivity.createNull();
      const response = await request(app)
        .post('/api/log-activity')
        .set('Content-Type', 'application/json')
        .send(logActivity);

      expect(response.status).toBe(204);
      const activities = await repository.replay();
      expect(activities).toEqual([logActivity]);
    });

    test('Handles unhappy path', async () => {
      let response = await request(app)
        .post('/api/log-activity')
        .set('Content-Type', 'application/json')
        .send({
          // missing timestamp and duration
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Recent activities', () => {
    // TODO create RecentActivitiesDto

    test('Runs happy path', async () => {
      const activity = Activity.createNull({
        timestamp: new Date('2024-04-05T06:30Z'),
        duration: new Duration('PT30M'),
      });
      await repository.record(activity);

      const response = await request(app)
        .get('/api/recent-activities')
        .query({ today: '2024-04-05T09:57' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        workingDays: [
          {
            date: '2024-04-04T22:00:00.000Z',
            activities: [
              {
                ...activity,
                timestamp: '2024-04-05T06:30:00.000Z',
                duration: 'PT30M',
              },
            ],
          },
        ],
        timeSummary: {
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        },
      });
    });
  });
});
