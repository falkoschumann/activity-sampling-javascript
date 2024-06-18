import express from 'express';

import {
  Duration,
  Logger,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/shared';
import { LogActivity, RecentActivitiesQuery } from '../domain/activities.js';

import { Services } from '../application/services.js';

export class Application {
  static create() {
    return new Application(
      Services.create(),
      Logger.getLogger('Application'),
      express(),
    );
  }

  #log;
  #app;
  /** @type {import ("node:http").Server} */ #server;

  constructor(
    /** @type {Services} */ services,
    /** @type {Logger} */ log,
    /** @type {express.Express} */ app,
  ) {
    this.#log = log;
    this.#app = app;

    app.set('x-powered-by', false);
    app.use(express.json());
    app.use('/', express.static('./public'));
    app.use('/api/', express.static('../../spec/api'));
    app.post('/api/log-activity', async (request, response) => {
      try {
        const logActivity = LogActivityDto.create(request.body).validate();
        await services.logActivity(logActivity);
        response.status(204).end();
      } catch (error) {
        log.error(error);
        response.status(400).end();
      }
    });
    app.get('/api/recent-activities', async (request, response) => {
      try {
        const { today } = RecentActivitiesQueryDto.create(
          request.query,
        ).validate();
        const body = await services.selectRecentActivities({ today });
        response
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .send(body);
      } catch (error) {
        log.error(error);
        response.status(400).end();
      }
    });
  }

  start({ port = 3000 } = {}) {
    return new Promise((resolve) => {
      this.#server = this.#app.listen(port, () => {
        this.#log.info(`Server is listening on port ${port}.`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.#server.on('close', () => {
        this.#log.info('Server stopped.');
        resolve();
      });
      this.#server.close();
    });
  }
}

class LogActivityDto {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new LogActivityDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  constructor(
    /** @type {string} */ timestamp,
    /** @type {string} */ duration,
    /** @type {string} */ client,
    /** @type {string} */ project,
    /** @type {string} */ task,
    /** @type {string} */ notes,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }

  validate() {
    const timestamp = validateRequiredProperty(
      this,
      'log activity',
      'timestamp',
      Date,
    );
    const duration = validateRequiredProperty(
      this,
      'log activity',
      'duration',
      Duration,
    );
    const client = validateRequiredProperty(
      this,
      'log activity',
      'client',
      'string',
    );
    const project = validateRequiredProperty(
      this,
      'log activity',
      'project',
      'string',
    );
    const task = validateRequiredProperty(
      this,
      'log activity',
      'task',
      'string',
    );
    const notes = validateOptionalProperty(
      this,
      'log activity',
      'notes',
      'string',
    );
    return LogActivity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

class RecentActivitiesQueryDto {
  static create({ today }) {
    return new RecentActivitiesQueryDto(today);
  }

  constructor(/** @type {string} */ today) {
    this.today = today;
  }

  validate() {
    const today = validateOptionalProperty(
      this,
      'recent activities query',
      'today',
      Date,
    );
    return RecentActivitiesQuery.create({ today });
  }
}
