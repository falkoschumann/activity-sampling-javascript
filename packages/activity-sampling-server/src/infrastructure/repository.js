import { existsSync, mkdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parse, stringify } from 'csv';

import { Duration } from 'activity-sampling-shared';

export class Repository {
  #fileName;

  constructor({ fileName = './data/activity-log.csv' } = {}) {
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
      duration: new Duration(record['duration']),
      client: record['client'],
      project: record['project'],
      task: record['task'],
      notes: record['notes'],
    };
  }

  #writeCsv(activity) {
    let existsFile = existsSync(this.#fileName);
    if (!existsFile) {
      const pathName = dirname(this.#fileName);
      mkdirSync(pathName, { recursive: true });
    }
    return stringify([this.#createRecord(activity)], {
      header: !existsFile,
      columns: ['timestamp', 'duration', 'client', 'project', 'task', 'notes'],
    });
  }

  #createRecord({ timestamp, duration, client, project, task, notes }) {
    return {
      timestamp: timestamp.toISOString(),
      duration: duration.toISOString(),
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
