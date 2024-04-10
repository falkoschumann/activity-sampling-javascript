import express from 'express';

import { Duration } from 'activity-sampling-shared';
import * as services from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

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
      let logActivity = parseLogActivity(request);
      if (logActivity == null) {
        response.status(400).end();
      } else {
        await services.logActivity(logActivity, this.#repository);
        response.status(204).end();
      }
    });
    this.#app.get('/api/recent-activities', async (request, response) => {
      // TODO create DTO {today}
      // TODO today is optional
      // TODO handle today is invalid date
      const today = new Date(request.query.today);
      const body = await services.selectRecentActivities(
        { today },
        this.#repository,
      );
      response
        .status(200)
        .header({ 'Content-Type': 'application/json' })
        .send(body);
    });
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Activity Sampling app listening on port ${port}`);
    });
  }
}

function parseLogActivity(request) {
  // TODO create DTO {timestamp, duration, client, project, task, notes}
  let logActivity = request.body;
  if (
    typeof logActivity.timestamp == 'string' &&
    (typeof logActivity.duration == 'number' ||
      typeof logActivity.duration == 'string') &&
    typeof logActivity.client == 'string' &&
    typeof logActivity.project == 'string' &&
    typeof logActivity.task == 'string' &&
    (logActivity.notes == null || typeof logActivity.notes == 'string')
  ) {
    return {
      timestamp: new Date(logActivity.timestamp),
      duration: new Duration(logActivity.duration),
      client: logActivity.client,
      project: logActivity.project,
      task: logActivity.task,
      notes: logActivity.notes,
    };
  }

  return null;
}
