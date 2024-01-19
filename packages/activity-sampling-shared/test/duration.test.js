import { describe, expect, test } from '@jest/globals';

import { Duration } from '../src/index.js';

describe('Constructor', () => {
  test('Creates duration with 0 seconds by default', () => {
    let duration = new Duration();

    expect(duration.seconds).toEqual(0);
  });

  test('Creates duration with given seconds', () => {
    let duration = new Duration(3600);

    expect(duration.seconds).toEqual(3600);
  });

  test('Creates duration from ISO 8601 string', () => {
    let duration = new Duration('PT1H1M1S');

    expect(duration.seconds).toEqual(3661);
  });

  test('Creates duration from ISO 8601 string with hours', () => {
    let duration = new Duration('PT1H');

    expect(duration.seconds).toEqual(3600);
  });

  test('Creates duration from ISO 8601 string with minutes', () => {
    let duration = new Duration('PT1M');

    expect(duration.seconds).toEqual(60);
  });

  test('Creates duration from ISO 8601 string with seconds', () => {
    let duration = new Duration('PT1S');

    expect(duration.seconds).toEqual(1);
  });

  test('Throws error, if string is not ISO 8601', () => {
    expect(() => new Duration('foo')).toThrow(TypeError);
  });

  test('Throws error, if seconds is eiter number nor string', () => {
    expect(() => new Duration({})).toThrow(TypeError);
  });
});

describe('Plus', () => {
  test('Adds durations', () => {
    let duration = new Duration(3600);

    duration.plus(new Duration(1800));

    expect(duration).toEqual(new Duration(5400));
  });

  test('Adds seconds', () => {
    let duration = new Duration(3600);

    duration.plus(1800);

    expect(duration).toEqual(new Duration(5400));
  });
});

describe('ToISOString', () => {
  test('Returns ISO 8601 string', () => {
    let duration = new Duration(3661);

    expect(duration.toISOString()).toEqual('PT1H1M1S');
  });

  test('Returns ISO 8601 string with hours', () => {
    let duration = new Duration(3600);

    expect(duration.toISOString()).toEqual('PT1H');
  });

  test('Returns ISO 8601 string with minutes', () => {
    let duration = new Duration(60);

    expect(duration.toISOString()).toEqual('PT1M');
  });

  test('Returns ISO 8601 string with seconds', () => {
    let duration = new Duration(1);

    expect(duration.toISOString()).toEqual('PT1S');
  });

  test('Returns ISO 8601 string with seconds', () => {
    let duration = new Duration(619200);

    expect(duration.toISOString()).toEqual('PT172H');
  });
});

describe('ToJSON', () => {
  test('Returns ISO string', () => {
    let duration = new Duration(3600);

    expect(duration.toJSON()).toEqual('PT1H');
  });
});

describe('ToString', () => {
  test('Returns medium string as default', () => {
    let duration = new Duration(3661);

    expect(duration.toString({ style: 'foo' })).toEqual('01:01:01');
  });

  test('Returns short string', () => {
    let duration = new Duration(3661);

    expect(duration.toString({ style: 'short' })).toEqual('01:01');
  });

  test('Is used by string interpolation', () => {
    let duration = new Duration(3661);

    expect(`${duration}`).toEqual('01:01:01');
  });
});

describe('ValueOf', () => {
  test('Returns seconds', () => {
    let duration = new Duration(3661);

    expect(duration.valueOf()).toEqual(3661);
  });

  test('Is used by number addition', () => {
    let duration = new Duration(3661);

    expect(1 + duration).toEqual(3662);
  });

  test('Is used by string concatenation', () => {
    let duration = new Duration(3661);

    expect('' + duration).toEqual('3661');
  });
});
