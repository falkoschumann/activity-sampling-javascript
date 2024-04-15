import express from 'express';

import { Duration } from 'activity-sampling-shared';
import * as services from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';
import { Activity } from '../domain/activities.js';
import {
  validateOptionalProperty,
  validateRequiredProperty,
} from 'activity-sampling-shared/src/validation.js';

export class ActivitySamplingApp {
  #app;
  #repository;

  constructor({
    publicPath = './public',
    repository = new Repository(),
    app = express(),
  } = {}) {
    this.#repository = repository;

    this.#app = app;
    this.#app.set('x-powered-by', false);
    this.#app.use(express.json());
    this.#app.use('/', express.static(publicPath));
    this.#app.use('/api/', express.static('../../spec/api'));
    this.#app.post('/api/log-activity', async (request, response) => {
      try {
        const logActivity = LogActivityDto.create(request.body).validate();
        await services.logActivity(logActivity, this.#repository);
        response.status(204).end();
      } catch {
        response.status(400).end();
      }
    });
    this.#app.get('/api/recent-activities', async (request, response) => {
      try {
        const { today } = RecentActivitiesQuery.create(
          request.query,
        ).validate();
        const body = await services.selectRecentActivities(
          { today },
          this.#repository,
        );
        response
          .status(200)
          .header({ 'Content-Type': 'application/json' })
          .send(body);
      } catch {
        response.status(400).end();
      }
    });
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Activity Sampling app listening on port ${port}`);
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
    return Activity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

class RecentActivitiesQuery {
  static create({ today }) {
    return new RecentActivitiesQuery(today);
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
    return { today };
  }
}
