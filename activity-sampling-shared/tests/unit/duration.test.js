import { describe, expect, test } from '@jest/globals';

import { Duration } from '../../src/index.js';

describe('plus', () => {
  test('adds durations', () => {
    let duration = new Duration(3600);

    duration.plus(new Duration(1800));

    expect(duration).toEqual(new Duration(5400));
  });

  test('adds seconds', () => {
    let duration = new Duration(3600);

    duration.plus(1800);

    expect(duration).toEqual(new Duration(5400));
  });
});

describe('toString', () => {
  test('returns medium string as default', () => {
    let duration = new Duration(3661);

    expect(duration.toString({ style: 'foo' })).toEqual('01:01:01');
  });

  test('returns short string', () => {
    let duration = new Duration(3661);

    expect(duration.toString({ style: 'short' })).toEqual('01:01');
  });

  test('is used by string interpolation', () => {
    let duration = new Duration(3661);

    expect(`${duration}`).toEqual('01:01:01');
  });
});

describe('valueOf', () => {
  test('returns seconds', () => {
    let duration = new Duration(3661);

    expect(duration.valueOf()).toEqual(3661);
  });

  test('is used by number addition', () => {
    let duration = new Duration(3661);

    expect(1 + duration).toEqual(3662);
  });

  test('is used by string concatenation', () => {
    let duration = new Duration(3661);

    expect('' + duration).toEqual('3661');
  });
});

describe('toJSON', () => {
  test('returns seconds', () => {
    let duration = new Duration(3600);

    expect(duration.toJSON()).toEqual(3600);
  });
});
