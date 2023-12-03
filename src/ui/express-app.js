import express from 'express';

import { Duration } from '../../public/js/domain/duration.js';
import { getRecentActivities, logActivity } from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #app;
  #today;
  #repository;

  constructor({
    publicPath = './public',
    today = new Date(),
    repository = new Repository(),
  } = {}) {
    this.#app = this.#createApp(publicPath);
    this.#today = today;
    this.#repository = repository;
    this.#createRoutes();
  }

  get app() {
    return this.#app;
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Activity Sampling app listening on port ${port}`);
    });
  }

  #createApp(publicPath) {
    let app = express();
    app.set('x-powered-by', false);
    app.use('/', express.static(publicPath));
    app.use(express.json());
    return app;
  }

  #createRoutes() {
    this.#createRouteRecentActivities();
    this.#createRouteLogActivity();
  }

  #createRouteRecentActivities() {
    this.#app.get('/api/recent-activities', async (request, response) => {
      let body = await getRecentActivities(
        { today: this.#today },
        this.#repository,
      );
      response
        .status(200)
        .header({ 'Content-Type': 'application/json' })
        .send(body);
    });
  }

  #createRouteLogActivity() {
    this.#app.post('/api/log-activity', async (request, response) => {
      let activity = parseActivity(request);
      if (activity == null) {
        response.status(400).end();
      } else {
        await logActivity(activity, this.#repository);
        response.status(201).end();
      }
    });
  }
}

function parseActivity(request) {
  let activity = request.body;
  if (
    typeof activity.timestamp == 'string' &&
    (typeof activity.duration == 'number' ||
      typeof activity.duration == 'string') &&
    typeof activity.client == 'string' &&
    typeof activity.project == 'string' &&
    typeof activity.task == 'string' &&
    typeof activity.notes == 'string'
  ) {
    return {
      timestamp: new Date(activity.timestamp),
      duration: new Duration(activity.duration),
      client: activity.client,
      project: activity.project,
      task: activity.task,
      notes: activity.notes,
    };
  }

  return null;
}
