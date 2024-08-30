import fs from 'node:fs/promises';
import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/utils';

import { ActivityLogged } from '../../src/domain/domain.js';
import { Repository } from '../../src/infrastructure/repository.js';

describe('Repository', () => {
  describe('Replay', () => {
    test('Returns list of events', async () => {
      const { repository } = await configure();

      const events = await Array.fromAsync(repository.replay());

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
      const { repository } = await configure({
        filename: '../data/non-existent.csv',
      });

      const events = await Array.fromAsync(repository.replay());

      expect(events).toEqual([]);
    });

    test('Fails when file is corrupt', async () => {
      const { repository } = await configure({
        filename: '../data/corrupt.csv',
      });

      const events = Array.fromAsync(repository.replay());

      await expect(events).rejects.toThrow();
    });
  });

  describe('Record', () => {
    test('Creates file, if it does not exist', async () => {
      const { repository } = await configure({
        filename: '../../data/activity-log.test.csv',
        removeFile: true,
      });

      await repository.record(ActivityLogged.createTestInstance());

      const events = await Array.fromAsync(repository.replay());
      expect(events).toEqual([ActivityLogged.createTestInstance()]);
    });

    test('Adds activtiy to existing file', async () => {
      const { repository } = await configure({
        filename: '../../data/activity-log.test.csv',
        removeFile: true,
      });
      const event1 = ActivityLogged.createTestInstance({
        timestamp: new Date('2024-03-03T12:00'),
      });
      await repository.record(event1);

      const event2 = ActivityLogged.createTestInstance({
        timestamp: new Date('2024-03-04T12:30'),
      });
      await repository.record(event2);

      const events = await Array.fromAsync(repository.replay());
      expect(events).toEqual([event1, event2]);
    });
  });

  describe('Nullable', () => {
    test('Replays events', async () => {
      const repository = Repository.createNull();

      const events = await Array.fromAsync(repository.replay());

      expect(events).toEqual([
        ActivityLogged.create({
          timestamp: new Date('2024-03-03T12:00'),
          duration: new Duration('PT30M'),
          client: 'Test client',
          project: 'Test project',
          task: 'Test task',
          notes: 'Test notes',
        }),
      ]);
    });

    test('Tracks events recorded', async () => {
      const repository = Repository.createNull();
      const eventsRecorded = repository.trackEventsRecorded();

      await repository.record(ActivityLogged.createTestInstance());

      expect(eventsRecorded.data).toEqual([
        ActivityLogged.createTestInstance(),
      ]);
    });
  });
});

async function configure({
  filename = '../data/example.csv',
  removeFile = false,
} = {}) {
  filename = new URL(filename, import.meta.url).pathname;
  if (removeFile) {
    await fs.rm(filename, { force: true });
  }
  const repository = Repository.create({ filename });
  return { repository };
}
