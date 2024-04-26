import { Clock } from './clock.js';
import { OutputTracker } from './output-tracker.js';

const MESSAGES_EVENT = 'messages';

export class Level {
  static #levels = [];

  static OFF = new Level('OFF', Number.MAX_SAFE_INTEGER);
  static ERROR = new Level('ERROR', 1000);
  static WARNING = new Level('WARNING', 900);
  static INFO = new Level('INFO', 800);
  static DEBUG = new Level('DEBUG', 700);
  static TRACE = new Level('TRACE', 600);
  static ALL = new Level('ALL', Number.MIN_SAFE_INTEGER);

  static parse(/** @type {string|number} */ name) {
    return Level.#levels.find(
      (level) => level.name === String(name) || level.value === Number(name),
    );
  }

  constructor(name, value) {
    this.name = name;
    this.value = value;
    Level.#levels.push(this);
  }

  toString() {
    return this.name;
  }

  valueOf() {
    return this.value;
  }
}

export class Logger extends EventTarget {
  // TODO implement logger hierarchy

  static getLogger(/** @type {string} */ name = '') {
    return new Logger(name, Level.INFO, Clock.create(), new ConsoleHandler());
  }

  static createNull({ level = Level.INFO, clock = Clock.createNull() } = {}) {
    return new Logger('null-logger', level, clock, new NullHandler());
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
    this.log(Level.ERROR, ...message);
  }

  warning(...message) {
    this.log(Level.WARNING, ...message);
  }

  info(...message) {
    this.log(Level.INFO, ...message);
  }

  debug(...message) {
    this.log(Level.DEBUG, ...message);
  }

  trace(...message) {
    this.log(Level.TRACE, ...message);
  }

  log(level, ...message) {
    if (level < this.level) {
      return;
    }

    const record = new LogRecord(this.#clock.date(), this.name, level, message);
    this.#handler.publish(record);
    this.dispatchEvent(
      new CustomEvent(MESSAGES_EVENT, {
        detail: { ...record },
      }),
    );
  }

  trackMessages() {
    return new OutputTracker(this, MESSAGES_EVENT);
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
    const message = record.loggerName
      ? [
          record.timestamp,
          record.loggerName,
          record.level.toString(),
          ...record.message,
        ]
      : [record.timestamp, record.level.toString(), ...record.message];

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
