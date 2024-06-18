import { rmSync } from 'node:fs';
import express from 'express';
import { beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import {
  Duration,
  Level,
  Logger,
  ValidationError,
} from '@activity-sampling/shared';
import { Services } from '../../src/application/services.js';
import { Activity, LogActivity } from '../../src/domain/activities.js';
import { Repository } from '../../src/infrastructure/repository.js';
import { Application } from '../../src/ui/application.js';

const filename = new URL('../../data/activity-log.test.csv', import.meta.url)
  .pathname;

describe('Activity Sampling App', () => {
  beforeEach(() => {
    rmSync(filename, { force: true });
  });

  test('Starts and stops the app', async () => {
    const { application, log } = configure();
    const loggedMessages = log.trackMessagesLogged();

    await application.start({ port: 3333 });
    await application.stop();

    expect(loggedMessages.data).toEqual([
      {
        loggerName: 'null-logger',
        level: Level.INFO,
        message: ['Server is listening on port 3333.'],
        timestamp: new Date('2024-02-21T19:16:00Z'),
      },
      {
        loggerName: 'null-logger',
        level: Level.INFO,
        message: ['Server stopped.'],
        timestamp: new Date('2024-02-21T19:16:00Z'),
      },
    ]);
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
      const { app, log } = configure();
      const loggedMessages = log.trackMessagesLogged();

      const response = await request(app)
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
      expect(loggedMessages.data).toEqual([
        {
          loggerName: 'null-logger',
          level: Level.ERROR,
          message: [expect.any(ValidationError)],
          timestamp: new Date('2024-02-21T19:16:00Z'),
        },
      ]);
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
      const { app, log } = configure();
      const loggedMessages = log.trackMessagesLogged();

      const response = await request(app)
        .get('/api/recent-activities')
        .query({ today: '2024-13-05T09:57' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(loggedMessages.data).toEqual([
        {
          loggerName: 'null-logger',
          level: Level.ERROR,
          message: [expect.any(ValidationError)],
          timestamp: new Date('2024-02-21T19:16:00Z'),
        },
      ]);
    });
  });
});

function configure() {
  const repository = Repository.create({ filename });
  const services = new Services(repository);
  const log = Logger.createNull();
  const app = express();
  const application = new Application(services, log, app);
  return { application, repository, log, app };
}
