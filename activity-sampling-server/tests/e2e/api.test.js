import { describe, expect, test } from '@jest/globals';
import request from 'supertest';
import { Repository } from '../../src/infrastructure/repository.js';

import { ExpressApp } from '../../src/ui/express-app.js';

let fileName = new URL('../data/example.csv', import.meta.url);

describe('API', () => {
  describe('get recent activities', () => {
    test('returns recent activities', async () => {
      let repository = new Repository({ fileName });
      let app = new ExpressApp({ repository }).app;

      let response = await request(app)
        .get('/api/get-recent-activities')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        workingDays: [
          {
            date: '2023-10-07T00:00:00.000Z',
            activities: [
              {
                timestamp: '2023-10-07T13:00:00.000Z',
                duration: 'PT30M',
                client: 'Muspellheim',
                project: 'Activity Sampling',
                task: 'Recent Activities',
                notes: 'Show my recent activities',
              },
            ],
          },
        ],
      });
    });
  });
});
