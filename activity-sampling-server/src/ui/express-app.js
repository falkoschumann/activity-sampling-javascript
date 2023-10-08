import express from 'express';

export class ExpressApp {
  #publicPath;
  #app;

  constructor({ publicPath = './public' } = {}) {
    this.#publicPath = publicPath;
    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use('/', express.static(publicPath));
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Activity Sampling app listening on port ${port}`);
    });
  }
}
