import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { Repository } from '../../src/infrastructure/repository.js';
import { ExpressApp } from '../../src/ui/express-app.js';

const fileName = fileURLToPath(
  new URL('../../data/activity-log.test.csv', import.meta.url),
);
let repository;
let app;

describe('API', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
    repository = new Repository({ fileName });
    app = new ExpressApp({
      today: new Date('2023-10-07T14:00+0200'),
      repository,
    }).app;
  });

  describe('Log activity', () => {
    test('Happy path returns status 201 and logs activity', async () => {
      let response = await request(app)
        .post('/api/log-activity')
        .set('Content-Type', 'application/json')
        .send({
          timestamp: '2023-10-07T11:00Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });
      expect(response.status).toBe(201);

      response = await request(app)
        .get('/api/recent-activities')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        workingDays: [
          {
            date: '2023-10-06T22:00:00.000Z',
            activities: [
              {
                timestamp: '2023-10-07T11:00:00.000Z',
                duration: 'PT30M',
                client: 'Muspellheim',
                project: 'Activity Sampling',
                task: 'Recent Activities',
                notes: 'Show my recent activities',
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

    test('Unhappy path returns status 400', async () => {
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
});
