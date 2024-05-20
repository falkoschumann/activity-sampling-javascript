import { Clock, Duration, Timer, createStore } from '@activity-sampling/shared';
import { Api } from '../infrastructure/api.js';
import { reducer } from '../domain/reducer.js';

export class Services {
  static create() {
    return new Services(
      undefined,
      Api.create(),
      Timer.create(),
      Clock.create(),
    );
  }

  static createNull() {
    return new Services(
      undefined,
      Api.createNull(),
      Timer.createNull(),
      Clock.createNull(),
    );
  }

  #api;
  #timer;
  #store;
  #clock;

  constructor(
    preloadedState,
    /** @type {Api} */ api,
    /** @type {Timer} */ timer,
    /** @type {Clock} */ clock,
  ) {
    this.#api = api;
    this.#timer = timer;
    this.#clock = clock;
    this.#store = createStore(reducer, preloadedState);
  }

  get store() {
    return this.#store;
  }

  async activityUpdated({ name, value }) {
    this.#store.dispatch({ type: 'activity-updated', name, value });
  }

  async logActivity() {
    const activity = { ...this.#store.getState().currentActivity.activity };
    if (!activity.timestamp) {
      activity.timestamp = this.#clock.date();
    }
    await this.#api.logActivity(activity);
    this.#store.dispatch({ type: 'activity-logged', activity });
  }

  async askPeriodically({ period }) {
    this.#timer.schedule(() => {
      const timestamp = this.#clock.date();
      const duration = new Duration('PT1S');
      this.#store.dispatch({
        type: 'countdown-progressed',
        timestamp,
        duration,
      });
    }, 1000);
    this.#store.dispatch({ type: 'countdown-started', period });
  }

  async stopAskingPeriodically() {
    this.#timer.cancel();
    this.#store.dispatch({ type: 'countdown-stopped' });
  }

  /** @deprecated */
  async activitySelected({ client, project, task, notes }) {
    this.#store.dispatch({
      type: 'activity-selected',
      client,
      project,
      task,
      notes,
    });
  }

  async selectRecentActivities() {
    const recentActivities = await this.#api.loadRecentActivities();
    this.#store.dispatch({
      type: 'recent-activities-loaded',
      recentActivities,
    });
  }

  async selectHoursWorked() {
    const hoursWorked = await this.#api.loadHoursWorked();
    this.#store.dispatch({ type: 'hours-worked-loaded', hoursWorked });
  }
}
