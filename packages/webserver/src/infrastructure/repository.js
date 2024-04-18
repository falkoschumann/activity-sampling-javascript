import fsPromises from 'node:fs/promises';
import path from 'node:path';
import * as csv from 'csv';

import {
  Duration,
  OutputTracker,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/shared';

import { ActivityLogged } from '../domain/activities.js';

const RFC4180 = {
  delimiter: ',',
  eof: true,
  quote: '"',
  record_delimiter: '\r\n',
  cast: (value, { quoting }) => (value === '' && !quoting ? undefined : value),
};

export class Repository extends EventTarget {
  static create({ fileName = './data/activity-log.csv' } = {}) {
    return new Repository(fileName, fsPromises);
  }

  static createNull({
    /** @type {ActivityLogged[]} */ events = [],
    /** @type {ActivityLoggedDto[]} */ dtos = [],
  } = {}) {
    dtos = dtos.concat(events.map(ActivityLoggedDto.fromDomain));
    return new Repository('null-file.csv', createFsStub(dtos));
  }

  #fileName;
  #fs;

  constructor(
    /** @type {string} */ fileName,
    /** @type {typeof fsPromises} */ fs,
  ) {
    super();
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async replay() {
    let string = await this.#readFile();
    return this.#parseCsv(string);
  }

  async record(/** @type {ActivityLogged} */ event) {
    const dto = ActivityLoggedDto.fromDomain(event);
    let csv = await this.#stringifyCsv(dto);
    await this.#writeFile(csv);
    this.dispatchEvent(new CustomEvent('recorded', { detail: event }));
  }

  trackRecorded() {
    return new OutputTracker(this, 'recorded');
  }

  async #readFile() {
    try {
      return await this.#fs.readFile(this.#fileName, { encoding: 'utf-8' });
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
      .access(this.#fileName, this.#fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  async #writeFile(string) {
    const pathName = path.dirname(this.#fileName);
    await this.#fs.mkdir(pathName, { recursive: true });
    await this.#fs.writeFile(this.#fileName, string, {
      encoding: 'utf-8',
      flag: 'a',
    });
  }
}

class ActivityLoggedDto {
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

  static fromDomain(
    /** @type {ActivityLogged} */ {
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    },
  ) {
    return ActivityLoggedDto.create({
      Timestamp: timestamp.toISOString(),
      Duration: duration.toISOString(),
      Client: client,
      Project: project,
      Task: task,
      Notes: notes,
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
      'activity logged',
      'Timestamp',
      Date,
    );
    const duration = validateRequiredProperty(
      this,
      'activity logged',
      'Duration',
      Duration,
    );
    const client = validateRequiredProperty(
      this,
      'activity logged',
      'Client',
      'string',
    );
    const project = validateRequiredProperty(
      this,
      'activity logged',
      'Project',
      'string',
    );
    const task = validateRequiredProperty(
      this,
      'activity logged',
      'Task',
      'string',
    );
    const notes = validateOptionalProperty(
      this,
      'activity logged',
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

function createFsStub(dtos) {
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
