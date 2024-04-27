import { describe, expect, test } from '@jest/globals';

import { Level, Logger } from '../src/logging.js';

describe('Logging', () => {
  describe('Level', () => {
    test('Converts to string', () => {
      const result = Level.INFO.toString();

      expect(result).toBe('INFO');
    });

    test('Converts to value', () => {
      const result = Level.INFO.valueOf();

      expect(result).toBe(800);
    });

    test('Parses level by name', () => {
      const level = Level.parse('WARNING');

      expect(level).toBe(Level.WARNING);
    });

    test('Parses level by value', () => {
      const level = Level.parse('1000');

      expect(level).toBe(Level.ERROR);
    });
  });

  describe('Logger', () => {
    test('Creates anonymous logger', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.info('my message');

      expect(log.name).toBeUndefined();
      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.INFO,
          message: ['my message'],
        },
      ]);
    });

    test('Creates named logger', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessages();

      log.info('my message');

      expect(log.name).toBe('test-logger');
      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'test-logger',
          level: Level.INFO,
          message: ['my message'],
        },
      ]);
    });

    test('Logs with level and message', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.log(Level.INFO, 'my message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.INFO,
          message: ['my message'],
        },
      ]);
    });

    test('Logs at level error', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.error('error message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.ERROR,
          message: ['error message'],
        },
      ]);
    });

    test('Logs at level warning', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.warning('warning message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.WARNING,
          message: ['warning message'],
        },
      ]);
    });

    test('Logs at level info', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.info('info message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.INFO,
          message: ['info message'],
        },
      ]);
    });

    test('Logs at level debug', () => {
      const log = Logger.getLogger();
      log.level = Level.ALL;
      const loggedMessages = log.trackMessages();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });

    test('Logs at level trace', () => {
      const log = Logger.getLogger();
      log.level = Level.ALL;
      const loggedMessages = log.trackMessages();

      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.TRACE,
          message: ['trace message'],
        },
      ]);
    });

    test('Logs at info level by default', () => {
      const log = Logger.getLogger();
      const loggedMessages = log.trackMessages();

      log.error('error message');
      log.warning('warning message');
      log.info('info message');
      log.debug('debug message');
      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.ERROR,
          message: expect.anything(),
        },
        {
          timestamp: expect.any(Date),
          level: Level.WARNING,
          message: expect.anything(),
        },
        {
          timestamp: expect.any(Date),
          level: Level.INFO,
          message: expect.anything(),
        },
      ]);
    });

    test('Does not log below level', () => {
      const log = Logger.getLogger();
      log.level = Level.WARNING;
      const loggedMessages = log.trackMessages();

      log.info('info message');

      expect(loggedMessages.data).toEqual([]);
    });

    test('Logs with local level if set', () => {
      const log = Logger.getLogger();
      log.level = Level.DEBUG;
      const loggedMessages = log.trackMessages();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });

    test('Logs with parent level if local level is not set', () => {
      Logger.getLogger('').level = Level.DEBUG;
      const log = Logger.getLogger();
      log.level = undefined;
      const loggedMessages = log.trackMessages();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });
  });
});
