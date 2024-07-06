import fs from 'node:fs/promises';
import express from 'express';
import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { Duration, Level, Logger } from '@activity-sampling/utils';
import { Activity, LogActivity } from '@activity-sampling/domain';
import { Services } from '../../src/application/services.js';
import { Repository } from '../../src/infrastructure/repository.js';
import { Application } from '../../src/ui/application.js';

const filename = new URL('../../data/activity-log.test.csv', import.meta.url)
  .pathname;

describe('Activity Sampling App', () => {
  test('Starts and stops the app', async () => {
    const { application, log } = await configure();
    const loggedMessages = log.trackMessagesLogged();

    await application.start({ port: 3333 });
    await application.stop();

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'null-logger',
        level: Level.INFO,
        message: ['Server is listening on port 3333.'],
      },
      {
        timestamp: expect.any(Date),

        loggerName: 'null-logger',
        level: Level.INFO,
        message: ['Server stopped.'],
      },
    ]);
  });

  describe('Log activity', () => {
    test('Runs happy path', async () => {
      const { app, repository } = await configure();

      const response = await request(app)
        .post('/api/log-activity')
        .set('Content-Type', 'application/json')
        .send(LogActivity.createTestInstance());

      expect(response.status).toBe(204);
      const activities = await repository.replay();
      expect(activities).toEqual([LogActivity.createTestInstance()]);
    });

    test('Handles unhappy path', async () => {
      const { app } = await configure();

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
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual(
        'The property "timestamp" is required for LogActivity.',
      );
    });
  });

  describe('Recent activities', () => {
    test('Runs happy path', async () => {
      const { app, repository } = await configure();
      const activity = Activity.createTestInstance({
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
                notes: undefined,
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
      const { app } = await configure();

      const response = await request(app)
        .get('/api/recent-activities')
        .query({ today: '2024-13-05T09:57' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.get('Content-Type')).toMatch(/text\/plain/);
      expect(response.text).toEqual(
        'The property "today" of RecentActivitiesQuery must be a valid Date, found string: "2024-13-05T09:57".',
      );
    });
  });
});

async function configure() {
  await fs.rm(filename, { force: true });
  const repository = Repository.create({ filename });
  const services = new Services(repository);
  const log = Logger.createNull();
  const app = express();
  const application = new Application(services, log, app);
  return { application, repository, log, app };
}
