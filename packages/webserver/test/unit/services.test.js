import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/shared';

import * as services from '../../src/application/services.js';
import { ActivityLogged } from '../../src/domain/activities.js';
import { Repository } from '../../src/infrastructure/repository.js';

// TODO do not write to console while testing

describe('Services', () => {
  describe('Log activity', () => {
    test('Logs the activity with client, project, task and optional notes', async () => {
      const repository = Repository.createNull();
      const trackAdded = repository.trackRecorded();

      const event = ActivityLogged.createNull();
      await services.logActivity(event, repository);

      expect(trackAdded.data).toEqual([event]);
    });
  });

  describe('Recent activities', () => {
    test('Groups activities by working days', async () => {
      const event1 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-03T12:00'),
      });
      const event2 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-04T12:00'),
      });
      const event3 = ActivityLogged.createNull({
        timestamp: new Date('2024-04-02T12:00'),
      });
      const event4 = ActivityLogged.createNull({
        timestamp: new Date('2024-04-03T12:00'),
      });
      const event5 = ActivityLogged.createNull({
        timestamp: new Date('2024-04-03T12:30'),
      });
      const event6 = ActivityLogged.createNull({
        timestamp: new Date('2024-04-04T12:00'),
      });
      const repository = Repository.createNull({
        events: [event1, event2, event3, event4, event5, event6],
      });

      let result = await services.selectRecentActivities(
        { today: new Date('2024-04-04T00:00') },
        repository,
      );

      // ignores activity1 because it is older than 30 days
      expect(result.workingDays).toEqual([
        {
          date: new Date('2024-04-04T00:00'),
          activities: [event6],
        },
        {
          date: new Date('2024-04-03T00:00'),
          activities: [event5, event4],
        },
        {
          date: new Date('2024-04-02T00:00'),
          activities: [event3],
        },
        {
          date: new Date('2024-03-04T00:00'),
          activities: [event2],
        },
      ]);
    });

    test('Summarizes hours worked today, yesterday, this week, and this month', async () => {
      // last day of last month
      const event1 = ActivityLogged.createNull({
        timestamp: new Date('2024-02-29T12:00'),
        duration: new Duration('PT30M'),
      });
      // first day of this month
      const event2 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-01T12:00'),
        duration: new Duration('PT30M'),
      });
      // sunday of last week
      const event3 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-24T12:00'),
        duration: new Duration('PT30M'),
      });
      // monday this week
      const event4 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-25T12:00'),
        duration: new Duration('PT30M'),
      });
      // day before yesterday
      const event5 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-26T12:00'),
        duration: new Duration('PT30M'),
      });
      // yesterday
      const event6 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-27T12:00'),
        duration: new Duration('PT30M'),
      });
      // today
      const event7 = ActivityLogged.createNull({
        timestamp: new Date('2024-03-28T12:00'),
        duration: new Duration('PT20M'),
      });
      let repository = Repository.createNull({
        events: [event1, event2, event3, event4, event5, event6, event7],
      });

      let result = await services.selectRecentActivities(
        { today: new Date('2024-03-28T00:00') },
        repository,
      );

      expect(result.timeSummary).toEqual({
        hoursToday: new Duration('PT20M'),
        hoursYesterday: new Duration('PT30M'),
        hoursThisWeek: new Duration('PT1H50M'),
        hoursThisMonth: new Duration('PT2H50M'),
      });
    });
  });
});