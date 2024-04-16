import { describe, expect, test } from '@jest/globals';

import { Clock } from '../../src/infrastructure/clock.js';

describe('Clock', () => {
  test('Gets a date', () => {
    const clock = Clock.create();

    const date = clock.date();

    expect(date).toBeInstanceOf(Date);
  });

  test('Gets a fixed date', () => {
    const clock = Clock.createNull({ fixed: '2024-02-21T19:22:58Z' });

    const date = clock.date();

    expect(date).toEqual(new Date('2024-02-21T19:22:58Z'));
  });
});
