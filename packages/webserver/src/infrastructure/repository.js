import fsPromises from 'node:fs/promises';
import path from 'node:path';
import * as csv from 'csv';

import {
  Duration,
  OutputTracker,
  validateNotEmptyProperty,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/utils';
import { ActivityLogged } from '../domain/domain.js';

const RFC4180 = {
  delimiter: ',',
  quote: '"',
  record_delimiter: '\r\n',
  comment: '#',
  comment_no_infix: true,
  skip_empty_lines: true,
  eof: true,
  cast: (value, { quoting }) => (value === '' && !quoting ? undefined : value),
};

export const EVENT_RECORDED_EVENT = 'event-recorded';

export class Repository extends EventTarget {
  static create({ filename = './data/activity-log.csv' } = {}) {
    return new Repository(filename, fsPromises);
  }

  static createNull({
    events = [
      ActivityLogged.create({
        timestamp: new Date('2024-03-03T12:00'),
        duration: new Duration('PT30M'),
        client: 'Test client',
        project: 'Test project',
        task: 'Test task',
        notes: 'Test notes',
      }),
    ],
  } = {}) {
    return new Repository('null-file.csv', createFsStub(events));
  }

  #filename;
  #fs;

  constructor(
    /** @type {string} */ fileName,
    /** @type {typeof fsPromises} */ fs,
  ) {
    super();
    this.#filename = fileName;
    this.#fs = fs;
  }

  async replay() {
    // TODO Return generator instead of array
    const string = await this.#readFile();
    return this.#parseCsv(string);
  }

  async record(/** @type {ActivityLogged} */ event) {
    const dto = ActivityLoggedDto.fromDomain(event);
    const csv = await this.#stringifyCsv(dto);
    await this.#writeFile(csv);
    this.dispatchEvent(
      new CustomEvent(EVENT_RECORDED_EVENT, { detail: event }),
    );
  }

  trackEventsRecorded() {
    return new OutputTracker(this, EVENT_RECORDED_EVENT);
  }

  async #readFile() {
    try {
      return await this.#fs.readFile(this.#filename, { encoding: 'utf-8' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // file does not exist
        return '';
      }

      throw error;
    }
  }

  async #parseCsv(string) {
    const parser = csv.parse(string, { ...RFC4180, columns: true });
    const events = [];
    for await (const record of parser) {
      var dto = ActivityLoggedDto.create(record);
      var event = dto.validate();
      events.push(event);
    }
    return events;
  }

  async #stringifyCsv(dto) {
    const isFileExist = await this.#isFileExist();
    return csv.stringify([dto], {
      ...RFC4180,
      header: !isFileExist,
      columns: ['Timestamp', 'Duration', 'Client', 'Project', 'Task', 'Notes'],
    });
  }

  async #isFileExist() {
    return this.#fs
      .access(this.#filename, this.#fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  async #writeFile(string) {
    const pathName = path.dirname(this.#filename);
    await this.#fs.mkdir(pathName, { recursive: true });
    await this.#fs.writeFile(this.#filename, string, {
      encoding: 'utf-8',
      flag: 'a',
    });
  }
}

export class ActivityLoggedDto {
  static create({ Timestamp, Duration, Client, Project, Task, Notes }) {
    return new ActivityLoggedDto(
      Timestamp,
      Duration,
      Client,
      Project,
      Task,
      Notes,
    );
  }

  static fromDomain(/** @type {ActivityLogged} */ event) {
    return ActivityLoggedDto.create({
      Timestamp: event.timestamp.toISOString(),
      Duration: event.duration.toISOString(),
      Client: event.client,
      Project: event.project,
      Task: event.task,
      Notes: event.notes,
    });
  }

  constructor(
    /** @type {string} */ Timestamp,
    /** @type {string} */ Duration,
    /** @type {string} */ Client,
    /** @type {string} */ Project,
    /** @type {string} */ Task,
    /** @type {string?} */ Notes,
  ) {
    this.Timestamp = Timestamp;
    this.Duration = Duration;
    this.Client = Client;
    this.Project = Project;
    this.Task = Task;
    this.Notes = Notes;
  }

  validate() {
    const timestamp = validateRequiredProperty(
      this,
      'ActivityLogged',
      'Timestamp',
      Date,
    );
    const duration = validateRequiredProperty(
      this,
      'ActivityLogged',
      'Duration',
      Duration,
    );
    const client = validateNotEmptyProperty(
      this,
      'ActivityLogged',
      'Client',
      'string',
    );
    const project = validateNotEmptyProperty(
      this,
      'ActivityLogged',
      'Project',
      'string',
    );
    const task = validateNotEmptyProperty(
      this,
      'ActivityLogged',
      'Task',
      'string',
    );
    const notes = validateOptionalProperty(
      this,
      'ActivityLogged',
      'Notes',
      'string',
    );
    return ActivityLogged.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

function createFsStub(events) {
  const dtos = events.map((event) => ({
    Timestamp: event.timestamp.toISOString(),
    Duration: event.duration.toISOString(),
    Client: event.client,
    Project: event.project,
    Task: event.task,
    Notes: event.notes,
  }));

  return {
    constants: { F_OK: 0 },

    access() {
      return Promise.resolve();
    },

    mkdir() {
      return Promise.resolve();
    },

    async readFile() {
      const stream = csv.stringify(dtos, {
        ...RFC4180,
        header: true,
        columns: [
          'Timestamp',
          'Duration',
          'Client',
          'Project',
          'Task',
          'Notes',
        ],
      });
      let data = '';
      for await (const chunk of stream) {
        data += chunk;
      }
      return data;
    },

    writeFile() {
      return Promise.resolve();
    },
  };
}
