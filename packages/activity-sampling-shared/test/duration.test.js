import { describe, expect, test } from '@jest/globals';

import { Duration } from '../src';

describe('Duration', () => {
  describe('Creation', () => {
    test('Creates duration with 0 seconds by default', () => {
      let duration = new Duration();

      expect(duration.seconds).toEqual(0);
    });

    test('Creates duration with given millis', () => {
      let duration = new Duration(3600);

      expect(duration.millis).toEqual(3600);
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

  describe('Value', () => {
    test('Returns hours', () => {
      const duration = new Duration('PT8H30M');

      expect(duration.hours).toEqual(8.5);
    });

    test('Returns minutes', () => {
      const duration = new Duration('PT8H30M24S');

      expect(duration.minutes).toEqual(510.4);
    });

    test('Returns seconds', () => {
      const duration = new Duration('PT8H30M24S');

      expect(duration.seconds).toEqual(30624);
    });

    test('Returns milliseconds', () => {
      const duration = new Duration('PT8H30M24.200S');

      expect(duration.millis).toEqual(30624200);
    });
  });

  describe('Part', () => {
    const duration = new Duration('PT8H30M24.500S');

    test('Returns hours part', () => {
      expect(duration.hoursPart).toEqual(8);
    });

    test('Returns minutes part', () => {
      expect(duration.minutesPart).toEqual(30);
    });

    test('Returns seconds part', () => {
      expect(duration.secondsPart).toEqual(24);
    });

    test('Returns milliseconds part', () => {
      expect(duration.millisPart).toEqual(500);
    });
  });

  describe('Add duration', () => {
    test('Adds duration', () => {
      let duration = new Duration(3600);

      duration.add(new Duration(1800));

      expect(duration).toEqual(new Duration(5400));
    });

    test('Adds seconds', () => {
      let duration = new Duration(3600);

      duration.add(1800);

      expect(duration).toEqual(new Duration(5400));
    });
  });

  describe('Convert to ISO 8601 string', () => {
    test('Returns ISO 8601 string', () => {
      let duration = new Duration(3661000);

      expect(duration.toISOString()).toEqual('PT1H1M1S');
    });

    test('Returns ISO 8601 string with hours', () => {
      let duration = new Duration(3600000);

      expect(duration.toISOString()).toEqual('PT1H');
    });

    test('Returns ISO 8601 string with minutes', () => {
      let duration = new Duration(60000);

      expect(duration.toISOString()).toEqual('PT1M');
    });

    test('Returns ISO 8601 string with seconds', () => {
      let duration = new Duration(1000);

      expect(duration.toISOString()).toEqual('PT1S');
    });

    test('Returns ISO 8601 string with seconds', () => {
      let duration = new Duration(619200000);

      expect(duration.toISOString()).toEqual('PT172H');
    });
  });

  describe('Convert to JSON', () => {
    test('Returns ISO string', () => {
      let duration = new Duration(3600000);

      expect(duration.toJSON()).toEqual('PT1H');
    });
  });

  describe('Convert to string', () => {
    test('Returns medium string as default', () => {
      let duration = new Duration(3661000);

      expect(duration.toString({ style: 'foo' })).toEqual('01:01:01');
    });

    test('Returns short string', () => {
      let duration = new Duration(3661000);

      expect(duration.toString({ style: 'short' })).toEqual('01:01');
    });

    test('Is used by string interpolation', () => {
      let duration = new Duration(3661000);

      expect(`${duration}`).toEqual('01:01:01');
    });
  });

  describe('Convert to value', () => {
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
});
