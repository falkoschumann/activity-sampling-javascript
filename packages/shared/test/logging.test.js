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

      expect(log.name).toBe('');
    });

    test('Creates named logger', () => {
      const log = Logger.getLogger('test-logger');

      expect(log.name).toBe('test-logger');
    });

    test('Logs at level error', () => {
      const log = Logger.createNull();
      const loggedMessages = log.trackLoggedMessages();

      log.error('error message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.ERROR,
          message: ['error message'],
        },
      ]);
    });

    test('Logs at level warning', () => {
      const log = Logger.createNull();
      const loggedMessages = log.trackLoggedMessages();

      log.warning('warning message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.WARNING,
          message: ['warning message'],
        },
      ]);
    });

    test('Logs at level info', () => {
      const log = Logger.createNull();
      const loggedMessages = log.trackLoggedMessages();

      log.info('info message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.INFO,
          message: ['info message'],
        },
      ]);
    });

    test('Logs at level debug', () => {
      const log = Logger.createNull({ level: Level.ALL });
      const loggedMessages = log.trackLoggedMessages();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });

    test('Logs at level trace', () => {
      const log = Logger.createNull({ level: Level.ALL });
      const loggedMessages = log.trackLoggedMessages();

      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.TRACE,
          message: ['trace message'],
        },
      ]);
    });

    test('Logs at info level by default', () => {
      const log = Logger.createNull();
      const loggedMessages = log.trackLoggedMessages();

      log.error('error message');
      log.warning('warning message');
      log.info('info message');
      log.debug('debug message');
      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.ERROR,
          message: expect.anything(),
        },
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.WARNING,
          message: expect.anything(),
        },
        {
          timestamp: expect.any(Date),
          loggerName: 'null-logger',
          level: Level.INFO,
          message: expect.anything(),
        },
      ]);
    });

    test('Does not log below level', () => {
      const log = Logger.createNull({ level: Level.WARNING });
      const loggedMessages = log.trackLoggedMessages();

      log.info('info message');

      expect(loggedMessages.data).toEqual([]);
    });
  });
});
