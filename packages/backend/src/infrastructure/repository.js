import fsPromises from 'node:fs/promises';
import path from 'node:path';
import stream from 'node:stream';
import * as csv from 'csv';

import { Duration, OutputTracker } from '@muspellheim/utils';

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

  async *replay() {
    let parser;
    try {
      const fileHandle = await this.#fs.open(this.#filename, 'r');
      parser = fileHandle
        .createReadStream({ encoding: 'utf-8' })
        .pipe(csv.parse({ ...RFC4180, columns: true }));
      for await (const record of parser) {
        var dto = ActivityLogged.create({
          timestamp: record.Timestamp,
          duration: record.Duration,
          client: record.Client,
          project: record.Project,
          task: record.Task,
          notes: record.Notes,
        });
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

  async record(/** @type {ActivityLogged} */ event) {
    const dto = {
      Timestamp: event.timestamp.toJSON(),
      Duration: event.duration.toJSON(),
      Client: event.client,
      Project: event.project,
      Task: event.task,
      Notes: event.notes,
    };
    const csv = await this.#stringifyCsv(dto);
    await this.#writeFile(csv);
    this.dispatchEvent(
      new CustomEvent(EVENT_RECORDED_EVENT, { detail: event }),
    );
  }

  trackEventsRecorded() {
    return new OutputTracker(this, EVENT_RECORDED_EVENT);
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
