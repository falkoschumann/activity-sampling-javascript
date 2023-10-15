import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { Repository } from '../../src/infrastructure/repository.js';

import { ExpressApp } from '../../src/ui/express-app.js';

let fileName = new URL('../data/example.csv', import.meta.url);

describe('get recent activities', () => {
  test('returns recent activities', async () => {
    let repository = new Repository({ fileName });
    let app = new ExpressApp({
      today: new Date('2023-10-07T14:00'),
      repository,
    }).app;

    let response = await request(app)
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
              duration: 30,
              client: 'Muspellheim',
              project: 'Activity Sampling',
              task: 'Recent Activities',
              notes: 'Show my recent activities',
            },
          ],
        },
      ],
      timeSummary: {
        hoursToday: 0.5,
        hoursYesterday: 0,
        hoursThisWeek: 0.5,
        hoursThisMonth: 0.5,
      },
    });
  });
});
