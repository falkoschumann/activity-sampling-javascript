import { parse, stringify } from 'csv';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

export class AbstractRepository {
  async findAll() {
    return [];
  }

  // eslint-disable-next-line no-unused-vars
  async add(activity) {
    return;
  }
}

export class Repository extends AbstractRepository {
  #fileName;

  constructor({ fileName = './data/activity-log.csv' } = {}) {
    super();
    this.#fileName = fileName;
  }

  async findAll() {
    let csv = await this.#readFile();
    return this.#parseCsv(csv);
  }

  async add({ timestamp, duration, client, project, task, notes }) {
    let csv = this.#writeCsv({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
    await this.#writeFile(csv);
  }

  async #readFile() {
    try {
      return await readFile(this.#fileName, { encoding: 'utf-8' });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return '';
      }
      throw error;
    }
  }

  async #parseCsv(csv) {
    let records = parse(csv, { columns: true });
    let activities = [];
    for await (let record of records) {
      activities.push(this.#parseRecord(record));
    }
    return activities;
  }

  #parseRecord(record) {
    return {
      timestamp: new Date(record['timestamp']),
      duration: Number(record['duration']),
      client: record['client'],
      project: record['project'],
      task: record['task'],
      notes: record['notes'],
    };
  }

  #writeCsv(activity) {
    let existsFile = existsSync(this.#fileName);
    return stringify([this.#createRecord(activity)], {
      header: !existsFile,
      columns: ['timestamp', 'duration', 'client', 'project', 'task', 'notes'],
    });
  }

  #createRecord({ timestamp, duration, client, project, task, notes }) {
    return {
      timestamp: timestamp.toISOString(),
      duration,
      client,
      project,
      task,
      notes,
    };
  }

  async #writeFile(csv) {
    await writeFile(this.#fileName, csv, { flag: 'a' });
  }
}
