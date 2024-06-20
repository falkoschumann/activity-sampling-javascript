import fs from 'node:fs/promises';
import express from 'express';
import { describe, expect, test } from '@jest/globals';
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
import {
  LogActivityDto,
  RecentActivitiesQueryDto,
} from '../../src/ui/activities-controller.js';

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

    describe('Validation', () => {
      test('Reports an error, if timestamp is missing', () => {
        const dto = LogActivityDto.create({
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "timestamp" is required for LogActivity.'),
        );
      });

      test('Reports an error, if timestamp is invalid', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-13-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "timestamp" of LogActivity must be a valid Date, found string: "2024-13-02T11:35Z".',
          ),
        );
      });

      test('Reports an error, if duration is missing', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "duration" is required for LogActivity.'),
        );
      });

      test('Reports an error, if duration is invalid', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: '30m',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "duration" of LogActivity must be a valid Duration, found string: "30m".',
          ),
        );
      });

      test('Reports an error, if client is missing', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "client" is required for LogActivity.'),
        );
      });

      test('Reports an error, if client is empty', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: '',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "client" of LogActivity must not be empty.'),
        );
      });

      test('Reports an error, if project is missing', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "project" is required for LogActivity.'),
        );
      });

      test('Reports an error, if project is empty', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: '',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "project" of LogActivity must not be empty.'),
        );
      });

      test('Reports an error, if task is missing', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "task" is required for LogActivity.'),
        );
      });

      test('Reports an error, if task is empty', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: '',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "task" of LogActivity must not be empty.'),
        );
      });

      test('Reports no error, if notes is missing', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });

      test('Reports no error, if notes is empty', () => {
        const dto = LogActivityDto.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: '',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });
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

    describe('Validation', () => {
      test('Reports no error, if today is missing', () => {
        const dto = RecentActivitiesQueryDto.create();

        expect(() => dto.validate()).not.toThrow();
      });

      test('Reports an error, if today is invalid', () => {
        const dto = RecentActivitiesQueryDto.create({
          today: '2024-13-02T11:35Z',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "today" of RecentActivitiesQuery must be a valid Date, found string: "2024-13-02T11:35Z".',
          ),
        );
      });
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
