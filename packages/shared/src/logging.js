import { Clock } from './clock.js';
import { OutputTracker } from './output-tracker.js';

const LOGGED_MESSAGES_EVENT = 'logged-messages';

export class Level {
  static NONE = new Level('NONE', Number.MAX_SAFE_INTEGER);
  static ERROR = new Level('ERROR', 1000);
  static WARNING = new Level('WARNING', 900);
  static INFO = new Level('INFO', 800);
  static DEBUG = new Level('DEBUG', 700);
  static TRACE = new Level('TRACE', 600);
  static ALL = new Level('ALL', Number.MIN_SAFE_INTEGER);

  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  toString() {
    return this.name;
  }

  valueOf() {
    return this.value;
  }
}

export class Logger extends EventTarget {
  static create({
    name = 'global',
    level = Level.INFO,
    clock = Clock.create(),
  } = {}) {
    return new Logger(name, level, clock, new ConsoleHandler());
  }

  static createNull({
    name = 'null-logger',
    level = Level.INFO,
    clock = Clock.createNull(),
  } = {}) {
    return new Logger(name, level, clock, new NullHandler());
  }

  #clock;
  #handler;

  constructor(
    /** @type {string} */ name,
    /** @type {Level} */ level,
    /** @type {Clock} */ clock,
    /** @type {Handler} */ handler,
  ) {
    super();
    this.name = name;
    this.level = level;
    this.#clock = clock;
    this.#handler = handler;
  }

  error(...message) {
    this.#log(Level.ERROR, ...message);
  }

  warning(...message) {
    this.#log(Level.WARNING, ...message);
  }

  info(...message) {
    this.#log(Level.INFO, ...message);
  }

  debug(...message) {
    this.#log(Level.DEBUG, ...message);
  }

  trace(...message) {
    this.#log(Level.TRACE, ...message);
  }

  #log(level, ...message) {
    if (level < this.level) {
      return;
    }

    const record = new LogRecord(this.#clock.date(), this.name, level, message);
    this.#handler.publish(record);
    this.dispatchEvent(
      new CustomEvent(LOGGED_MESSAGES_EVENT, {
        detail: { ...record },
      }),
    );
  }

  trackLoggedMessages() {
    return new OutputTracker(this, LOGGED_MESSAGES_EVENT);
  }
}

class LogRecord {
  constructor(
    /** @type {Date} */ timestamp,
    /** @type {string} */ loggerName,
    /** @type {Level} */ level,
    message,
  ) {
    this.timestamp = timestamp;
    this.loggerName = loggerName;
    this.level = level;
    this.message = message;
  }
}

/**
 * @typedef {Object} Handler
 * @property {(record: LogRecord) => void} publish
 */

class ConsoleHandler {
  publish(/** @type {LogRecord} */ record) {
    const message = [
      record.timestamp,
      record.loggerName,
      record.level.toString(),
      ...record.message,
    ];

    switch (record.level) {
      case Level.ERROR:
        console.error(...message);
        break;
      case Level.WARNING:
        console.warn(...message);
        break;
      case Level.INFO:
        console.info(...message);
        break;
      case Level.DEBUG:
        console.debug(...message);
        break;
      case Level.TRACE:
        console.trace(...message);
        break;
    }
  }
}

class NullHandler {
  publish() {}
}
