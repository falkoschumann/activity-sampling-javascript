import { parse } from 'csv-parse';
import { readFile } from 'node:fs/promises';

export class AbstractRepository {
  async findAll() {
    return [];
  }
}

export class Repository extends AbstractRepository {
  #fileName;

  constructor({ fileName = './data/activity-log.csv' } = {}) {
    super();
    this.#fileName = fileName;
  }

  async findAll() {
    let csv = await this.#openCsvFile();
    return this.#parseCsv(csv);
  }

  async #openCsvFile() {
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
      activities.push(this.#mapRecord(record));
    }
    return activities;
  }

  #mapRecord(record) {
    return {
      timestamp: new Date(record['timestamp']),
      duration: Number(record['duration']),
      client: record['client'],
      project: record['project'],
      task: record['task'],
      notes: record['notes'],
    };
  }
}
