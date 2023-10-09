import express from 'express';

export class ExpressApp {
  #app;

  constructor({ publicPath = './public' } = {}) {
    this.#app = this.#createApp(publicPath);
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
    this.#app.get('/api/get-recent-activities', (request, response) => {
      let recentActivties = {
        workingDays: [
          {
            date: '2023-10-07T00:00:00Z',
            activities: [
              {
                client: 'Muspellheim',
                duration: 'PT30M',
                notes: 'Show my recent activities',
                project: 'Activity Sampling',
                task: 'Recent Activities',
                timestamp: '2023-10-07T13:00:00Z',
              },
              {
                client: 'Muspellheim',
                duration: 'PT30M',
                notes: 'Show my recent activities',
                project: 'Activity Sampling',
                task: 'Recent Activities',
                timestamp: '2023-10-07T12:30:00Z',
              },
              {
                client: 'Muspellheim',
                duration: 'PT30M',
                notes: 'Show my recent activities',
                project: 'Activity Sampling',
                task: 'Recent Activities',
                timestamp: '2023-10-07T12:00:00Z',
              },
            ],
          },
        ],
      };
      response
        .status(200)
        .header({ 'Content-Type': 'application/json' })
        .send(recentActivties);
    });
  }
}

/*
let activities = [
  {
    timestamp: new Date('2023-10-07T13:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:30:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
  {
    timestamp: new Date('2023-10-07T12:00:00Z'),
    duration: 'PT30M',
    client: 'Muspellheim',
    project: 'Activity Sampling',
    task: 'Recent Activities',
    notes: 'Show my recent activities',
  },
];
*/
