import { describe, expect, test } from '@jest/globals';
import request from 'supertest';

import { ExpressApp } from '../../src/ui/express-app.js';

describe('API', () => {
  describe('get recent activities', () => {
    test('returns recent activities', async () => {
      let app = new ExpressApp().app;

      let response = await request(app)
        .get('/api/get-recent-activities')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.get('Content-Type')).toMatch(/application\/json/);
      expect(response.body).toEqual({
        workingDays: [
          {
            date: '2023-10-07T00:00:00Z',
            activities: [
              createActivity({ timestamp: '2023-10-07T13:00:00Z' }),
              createActivity({ timestamp: '2023-10-07T12:30:00Z' }),
              createActivity({ timestamp: '2023-10-07T12:00:00Z' }),
            ],
          },
        ],
      });
    });
  });
});

export function createActivity({
  timestamp = '2023-10-07T13:00:00Z',
  duration = 'PT30M',
  client = 'Muspellheim',
  project = 'Activity Sampling',
  task = 'Recent Activities',
  notes = 'Show my recent activities',
} = {}) {
  return { timestamp, duration, client, project, task, notes };
}
