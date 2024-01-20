import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, test } from '@jest/globals';

import { Duration } from 'activity-sampling-shared';
import { Repository } from '../../src/infrastructure/repository.js';
import { createActivity } from '../testdata.js';

const fileName = fileURLToPath(
  new URL('../../data/activity-log.test.csv', import.meta.url),
);

describe('Repository', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
  });

  describe('FindAll', () => {
    test('Returns list of activities', async () => {
      let repository = new Repository({
        fileName: new URL('../data/example.csv', import.meta.url),
      });

      let activities = await repository.findAll();

      expect(activities).toEqual([
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
      let repository = new Repository({
        fileName: new URL('../data/non-existent.csv', import.meta.url),
      });

      let activities = await repository.findAll();

      expect(activities).toEqual([]);
    });

    test('Reports an error, if file is corrupt', async () => {
      let repository = new Repository({
        fileName: new URL('../data/corrupt.csv', import.meta.url),
      });

      await expect(repository.findAll()).rejects.toThrow();
    });
  });

  describe('Add', () => {
    test('Creates file, if it does not exist', async () => {
      let repository = new Repository({ fileName });

      await repository.add(createActivity());

      let activities = await repository.findAll();
      expect(activities).toEqual([createActivity()]);
    });

    test('Adds activtiy to existing file', async () => {
      let repository = new Repository({ fileName });
      await repository.add(createActivity());

      await repository.add(createActivity());

      let activities = await repository.findAll();
      expect(activities).toEqual([createActivity(), createActivity()]);
    });
  });
});
