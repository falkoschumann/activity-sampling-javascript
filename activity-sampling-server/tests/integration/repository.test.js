import { describe, expect, test } from '@jest/globals';
import { Repository } from '../../src/infrastructure/repository.js';

describe('findAll', () => {
  test('returns list of activities', async () => {
    let repository = new Repository({
      fileName: new URL('../data/example.csv', import.meta.url),
    });

    let activities = await repository.findAll();

    expect(activities).toEqual([
      {
        timestamp: new Date('2023-10-07T13:00'),
        duration: 30,
        client: 'Muspellheim',
        project: 'Activity Sampling',
        task: 'Recent Activities',
        notes: 'Show my recent activities',
      },
    ]);
  });

  test('returns empty list, if file does not exist', async () => {
    let repository = new Repository({
      fileName: new URL('../data/non-existent.csv', import.meta.url),
    });

    let activities = await repository.findAll();

    expect(activities).toEqual([]);
  });

  test('reports an error, if file is corrupt', async () => {
    let repository = new Repository({
      fileName: new URL('../data/corrupt.csv', import.meta.url),
    });

    await expect(repository.findAll()).rejects.toThrow();
  });
});
