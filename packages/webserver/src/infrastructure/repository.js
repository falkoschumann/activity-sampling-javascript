import fsPromises from 'node:fs/promises';
import path from 'node:path';
import stream from 'node:stream';
import * as csv from 'csv';

import {
  Duration,
  ensureNonEmpty,
  ensureType,
  OutputTracker,
} from '@activity-sampling/utils';

import { ActivityLogged } from '../domain/domain.js';

const RFC4180 = {
  delimiter: ',',
  quote: '"',
  record_delimiter: '\r\n',
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
    return Array.fromAsync(this.#parseCsv());
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

  async *#parseCsv() {
    let parser;
    try {
      const fileHandle = await this.#fs.open(this.#filename, 'r');
      parser = fileHandle
        .createReadStream({ encoding: 'utf-8' })
        .pipe(csv.parse({ ...RFC4180, columns: true }));
      for await (const record of parser) {
        var dto = ActivityLoggedDto.create(record);
        var event = dto.validate();
        yield event;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    } finally {
      parser?.end();
    }
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
    const dto = ensureType(
      this,
      {
        Timestamp: Date,
        Duration: Duration,
        Client: String,
        Project: String,
        Task: String,
        Notes: [String, undefined],
      },
      { name: 'ActivityLogged' },
    );
    ensureNonEmpty(this.Client, { name: 'ActivityLogged.Client' });
    ensureNonEmpty(this.Project, { name: 'ActivityLogged.Project' });
    ensureNonEmpty(this.Task, { name: 'ActivityLogged.Task' });
    ensureNonEmpty(this.Notes, { name: 'ActivityLogged.Notes' });
    return ActivityLogged.create({
      timestamp: dto.Timestamp,
      duration: dto.Duration,
      client: dto.Client,
      project: dto.Project,
      task: dto.Task,
      notes: dto.Notes,
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

    async open() {
      return new FileHandleStub(dtos);
    },

    writeFile() {
      return Promise.resolve();
    },
  };
}

class FileHandleStub {
  #dtos;

  constructor(dtos) {
    this.#dtos = dtos;
  }

  createReadStream() {
    const data = csv.stringify(this.#dtos, { ...RFC4180, header: true });
    return stream.Readable.from(data, { encoding: 'utf-8' });
  }

  createWriteStream() {
    return new stream.Writable({
      write(chunk, encoding, callback) {
        callback();
      },
    });
  }

  close() {
    return Promise.resolve();
  }
}
