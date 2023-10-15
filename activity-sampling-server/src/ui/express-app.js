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
    this.#app.get('/api/recent-activities', async (request, response) => {
      let recentActivties = await getRecentActivities({ today }, repository);
      response
        .status(200)
        .header({ 'Content-Type': 'application/json' })
        .send(recentActivties);
    });
  }
}
