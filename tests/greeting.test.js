import { describe, expect, test } from '@jest/globals';

import { greeting } from '../src/greeting.js';

describe('greeting', () => {
  test('should return a greeting', () => {
    expect(greeting('World')).toBe('Hello World!');
  });
});
