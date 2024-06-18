import express from 'express';

import {
  Duration,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/shared';
import { LogActivity, RecentActivitiesQuery } from '../domain/activities.js';
import { reply, runSafe } from './handler.js';

/**
 * @typedef {import ('../application/services.js').Services} Services
 */

export class ActivitiesController {
  #services;

  constructor(
    /** @type {Services} */ services,
    /** @type {express.Express} */ app,
  ) {
    this.#services = services;
    app.use('/api/', express.static('../../spec/api'));
    app.post('/api/log-activity', runSafe(this.#postLogActivity.bind(this)));
    app.get(
      '/api/recent-activities',
      runSafe(this.#getRecentActivities.bind(this)),
    );
  }

  async #postLogActivity(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const logActivity = LogActivityDto.create(request.body).validate();
    await this.#services.logActivity(logActivity);
    reply(response, { status: 204 });
  }

  async #getRecentActivities(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const { today } = RecentActivitiesQueryDto.create(request.query).validate();
    const body = await this.#services.selectRecentActivities({ today });
    reply(response, { body });
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
