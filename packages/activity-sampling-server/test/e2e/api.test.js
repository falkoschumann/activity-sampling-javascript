import { rmSync } from 'node:fs';
import express from 'express';
import { beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { Duration } from 'activity-sampling-shared';

import { Activity, LogActivity } from '../../src/domain/activities.js';
import { Repository } from '../../src/infrastructure/repository.js';
import { ActivitySamplingApp } from '../../src/ui/activity-sampling-app.js';

const fileName = new URL('../../data/activity-log.test.csv', import.meta.url)
  .pathname;

describe('API', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
  });

  describe('Log activity', () => {
    test('Runs happy path', async () => {
      const { app, repository } = configure();

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
      const { app } = configure();

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
    test('Runs happy path', async () => {
      const { app, repository } = configure();
      const activity = Activity.createNull({
        timestamp: new Date(),
        duration: new Duration('PT30M'),
      });
      await repository.record(activity);

      const response = await request(app)
        .get('/api/recent-activities')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      const startOfTheDay = new Date();
      startOfTheDay.setHours(0, 0, 0, 0);
      expect(response.body).toEqual({
        workingDays: [
          {
            date: startOfTheDay.toISOString(),
            activities: [
              {
                ...activity,
                timestamp: activity.timestamp.toISOString(),
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

    test('Handles unhappy path', async () => {
      const { app } = configure();

      const response = await request(app)
        .get('/api/recent-activities')
        .query({ today: '2024-13-05T09:57' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });
  });
});

function configure() {
  const repository = Repository.create({ fileName });
  const app = express();
  ActivitySamplingApp.create({ repository, app });
  return { app, repository };
}
