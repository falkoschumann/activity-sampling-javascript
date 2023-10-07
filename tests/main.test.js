import { describe, expect, test } from '@jest/globals';

import { greeting } from '../src/main';

describe('greeting', () => {
  test('should return a greeting', () => {
    expect(greeting('World')).toBe('Hello World!');
  });
});
