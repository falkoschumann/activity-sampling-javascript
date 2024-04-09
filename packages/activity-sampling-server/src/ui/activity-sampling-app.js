import express from 'express';

import { Duration } from 'activity-sampling-shared';
import * as services from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

// TODO Extract controller
// TODO Extract DTOs

export class ActivitySamplingApp {
  #app;
  #repository;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#app = this.#createApp(publicPath);
    this.#repository = repository;
    this.#createRoutes();
  }

  // TODO replace with run() returning app or server
  get app() {
    return this.#app;
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Activity Sampling app listening on port ${port}`);
    });
  }

  #createApp(publicPath) {
    const app = express();
    app.set('x-powered-by', false);
    app.use(express.json());
    app.use('/', express.static(publicPath));
    app.use('/api/', express.static('../../spec/api'));
    return app;
  }

  #createRoutes() {
    this.#createRouteLogActivity();
    this.#createRouteRecentActivities();
  }

  #createRouteLogActivity() {
    this.#app.post('/api/log-activity', async (request, response) => {
      let logActivity = parseLogActivity(request);
      if (logActivity == null) {
        response.status(400).end();
      } else {
        await services.logActivity(logActivity, this.#repository);
        response.status(204).end();
      }
    });
  }

  #createRouteRecentActivities() {
    this.#app.get('/api/recent-activities', async (request, response) => {
      // FIXME today is optional
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
}

function parseLogActivity(request) {
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
