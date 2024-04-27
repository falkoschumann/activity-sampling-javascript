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
  static getLogger(/** @type {?string} */ name) {
    const manager = LogManager.getLogManager();
    let logger = manager.getLogger(name);
    if (logger == null) {
      logger = new Logger(manager.getLogger(''), name);
      manager.addLogger(logger);
    }
    return logger;
  }

  static createNull({ level = Level.INFO, clock = Clock.createNull() } = {}) {
    return new Logger(
      undefined,
      'null-logger',
      level,
      new NullHandler(),
      clock,
    );
  }

  #parent;
  #name;
  #level;
  #clock;
  #handler;

  constructor(
    /** @type {Logger} */ parent,
    /** @type {string} */ name,
    /** @type {Level} */ level,
    /** @type {Handler} */ handler,
    /** @type {Clock} */ clock,
  ) {
    super();
    this.#parent = parent;
    this.#name = name;
    this.#level = level;
    this.#handler = handler;
    this.#clock = clock;
  }

  get parent() {
    return this.#parent;
  }

  get name() {
    return this.#name;
  }

  get level() {
    return this.#level ?? this.#parent.level;
  }

  set level(/** @type {Level} */ level) {
    this.#level = level;
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

  isLoggable(/** @type {Level} */ level) {
    return level >= this.level;
  }

  log(/** @type {Level} */ level, ...message) {
    if (!this.isLoggable(level)) {
      return;
    }

    const record = new LogRecord(
      this.#getClock().date(),
      this.name,
      level,
      message,
    );
    this.#getHandler().publish(record);
    this.dispatchEvent(
      new CustomEvent(MESSAGES_EVENT, {
        detail: { ...record },
      }),
    );
  }

  #getClock() {
    return this.#clock ?? this.#parent.#getClock();
  }

  #getHandler() {
    return this.#handler ?? this.#parent.#getHandler();
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

class LogManager {
  static #loggers = new Map();

  static #logManager;

  static getLogManager() {
    if (!LogManager.#logManager) {
      LogManager.#logManager = new LogManager();
      const rootLogger = new Logger(
        undefined,
        '',
        Level.INFO,
        new ConsoleHandler(),
        Clock.create(),
      );
      LogManager.#logManager.addLogger(rootLogger);
    }
    return LogManager.#logManager;
  }

  addLogger(/** @type {Logger} */ logger) {
    if (logger.name == null) {
      return;
    }

    LogManager.#loggers.set(logger.name, logger);
  }

  getLogger(/** @type {string} */ name) {
    return LogManager.#loggers.get(name);
  }
}
