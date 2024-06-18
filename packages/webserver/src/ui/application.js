import express from 'express';

import { Logger } from '@activity-sampling/shared';
import { Services } from '../application/services.js';
import { ActivitiesController } from './activities-controller.js';
import { errorHandler } from './handler.js';

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
    new ActivitiesController(services, app);
    app.use(errorHandler());
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
