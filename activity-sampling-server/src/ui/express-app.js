import express from 'express';

import { getRecentActivities } from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #app;

  constructor({
    publicPath = './public',
    today = new Date(),
    repository = new Repository(),
  } = {}) {
    this.#app = this.#createApp(publicPath);
    this.#createRoutes(today, repository);
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

  #createRoutes(today, repository) {
    this.#createRouteRecentActivities(today, repository);
    this.#createRouteLogActivity(today, repository);
  }

  #createRouteRecentActivities(today, repository) {
    this.#app.get('/api/recent-activities', async (request, response) => {
      let recentActivties = await getRecentActivities({ today }, repository);
      response
        .status(200)
        .header({ 'Content-Type': 'application/json' })
        .send(recentActivties);
    });
  }

  #createRouteLogActivity(today, repository) {
    this.#app.post('/api/log-activity', async (request, response) => {
      let activity = this.#parseActivity(request);
      if (activity == null) {
        response.status(400).end();
      } else {
        await repository.add(activity);
        response.status(201).end();
      }
    });
  }

  #parseActivity(request) {
    let activity = request.body;
    if (
      typeof activity.timestamp == 'string' &&
      typeof activity.duration == 'number' &&
      typeof activity.client == 'string' &&
      typeof activity.project == 'string' &&
      typeof activity.task == 'string' &&
      typeof activity.notes == 'string'
    ) {
      return {
        timestamp: new Date(activity.timestamp),
        duration: activity.duration,
        client: activity.client,
        project: activity.project,
        task: activity.task,
        notes: activity.notes,
      };
    }

    return null;
  }
}
