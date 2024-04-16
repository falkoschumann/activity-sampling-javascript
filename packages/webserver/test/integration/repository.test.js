import fs from 'node:fs/promises';
import { beforeEach, describe, expect, test } from '@jest/globals';

import { Duration, ValidationError } from '@activity-sampling/shared';

import { ActivityLogged } from '../../src/domain/activities.js';
import { Repository } from '../../src/infrastructure/repository.js';

describe('Repository', () => {
  describe('Replay', () => {
    test('Returns list of events', async () => {
      const repository = Repository.create({
        fileName: new URL('../data/example.csv', import.meta.url),
      });

      const events = await repository.replay();

      expect(events).toEqual([
        {
          timestamp: new Date('2023-10-07T11:00Z'),
          duration: new Duration('PT30M'),
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        },
      ]);
    });

    test('Returns empty list, if file does not exist', async () => {
      const repository = Repository.create({
        fileName: new URL('../data/non-existent.csv', import.meta.url),
      });

      const events = await repository.replay();

      expect(events).toEqual([]);
    });

    test('Reports an error, if file is corrupt', async () => {
      const repository = Repository.create({
        fileName: new URL('../data/corrupt.csv', import.meta.url),
      });

      const events = repository.replay();

      await expect(events).rejects.toThrow();
    });

    describe('Validate', () => {
      test('Reports an error, if timestamp is invalid', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-13-02T11:35Z',
              Duration: 'PT30M',
              Client: 'Muspellheim',
              Project: 'Activity Sampling',
              Task: 'Recent Activities',
              Notes: 'Show my recent activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).rejects.toThrow(ValidationError);
      });

      test('Reports an error, if duration is invalid', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-04-02T11:35Z',
              Duration: '30m',
              Client: 'Muspellheim',
              Project: 'Activity Sampling',
              Task: 'Recent Activities',
              Notes: 'Show my recent activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).rejects.toThrow(ValidationError);
      });

      test('Reports an error, if client is missing', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-04-02T11:35Z',
              Duration: 'PT30M',
              Client: '',
              Project: 'Activity Sampling',
              Task: 'Recent Activities',
              Notes: 'Show my recent activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).rejects.toThrow(ValidationError);
      });

      test('Reports an error, if project is missing', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-04-02T11:35Z',
              Duration: 'PT30M',
              Client: 'Muspellheim',
              Project: '',
              Task: 'Recent Activities',
              Notes: 'Show my recent activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).rejects.toThrow(ValidationError);
      });

      test('Reports an error, if task is missing', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-04-02T11:35Z',
              Duration: 'PT30M',
              Client: 'Muspellheim',
              Project: 'Activity Sampling',
              Task: '',
              Notes: 'Show my recent activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).rejects.toThrow(ValidationError);
      });

      test('Reports no error, if notes is missing', async () => {
        const repository = Repository.createNull({
          dtos: [
            {
              Timestamp: '2024-04-02T11:35Z',
              Duration: 'PT30M',
              Client: 'Muspellheim',
              Project: 'Activity Sampling',
              Task: 'Recent Activities',
            },
          ],
        });

        const events = repository.replay();

        await expect(events).resolves.not.toThrow();
      });
    });
  });

  describe('Add', () => {
    const fileName = new URL(
      '../../data/activity-log.test.csv',
      import.meta.url,
    ).pathname;

    beforeEach(async () => {
      await fs.rm(fileName, { force: true });
    });

    test('Creates file, if it does not exist', async () => {
      const repository = Repository.create({ fileName });
      const event = ActivityLogged.createNull();

      await repository.record(event);

      const events = await repository.replay();
      expect(events).toEqual([event]);
    });

    test('Adds activtiy to existing file', async () => {
      const repository = Repository.create({ fileName });
      const event1 = ActivityLogged.createNull();
      await repository.record(event1);

      const event2 = ActivityLogged.createNull();
      await repository.record(event2);

      const events = await repository.replay();
      expect(events).toEqual([event1, event2]);
    });
  });
});
