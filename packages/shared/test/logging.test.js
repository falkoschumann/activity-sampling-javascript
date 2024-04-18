import { describe, expect, test } from '@jest/globals';

import { Level, Logger } from '../src/logging.js';

describe('Logging', () => {
  test('Logs at level error', () => {
    const log = Logger.create();
    const loggedMessages = log.trackLoggedMessages();

    log.error('error message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.ERROR,
        message: ['error message'],
      },
    ]);
  });

  test('Logs at level warning', () => {
    const log = Logger.create();
    const loggedMessages = log.trackLoggedMessages();

    log.warning('warning message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.WARNING,
        message: ['warning message'],
      },
    ]);
  });

  test('Logs at level info', () => {
    const log = Logger.create();
    const loggedMessages = log.trackLoggedMessages();

    log.info('info message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.INFO,
        message: ['info message'],
      },
    ]);
  });

  test('Logs at level debug', () => {
    const log = Logger.create({ level: Level.ALL });
    const loggedMessages = log.trackLoggedMessages();

    log.debug('debug message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.DEBUG,
        message: ['debug message'],
      },
    ]);
  });

  test('Logs at level trace', () => {
    const log = Logger.create({ level: Level.ALL });
    const loggedMessages = log.trackLoggedMessages();

    log.trace('trace message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.TRACE,
        message: ['trace message'],
      },
    ]);
  });

  test('Logs at info level by default', () => {
    const log = Logger.create();
    const loggedMessages = log.trackLoggedMessages();

    log.error('error message');
    log.warning('warning message');
    log.info('info message');
    log.debug('debug message');
    log.trace('trace message');

    expect(loggedMessages.data).toEqual([
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.ERROR,
        message: expect.anything(),
      },
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.WARNING,
        message: expect.anything(),
      },
      {
        timestamp: expect.any(Date),
        loggerName: 'global',
        level: Level.INFO,
        message: expect.anything(),
      },
    ]);
  });

  test('Does not log below level', () => {
    const log = Logger.create({
      level: Level.WARNING,
    });
    const loggedMessages = log.trackLoggedMessages();

    log.info('info message');

    expect(loggedMessages.data).toEqual([]);
  });
});
