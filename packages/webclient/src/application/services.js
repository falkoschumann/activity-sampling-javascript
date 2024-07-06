import { Clock, Duration, Timer, createStore } from '@activity-sampling/utils';
import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';

export class Services {
  static #instance = new Services(
    undefined,
    Api.create(),
    Timer.create(),
    Clock.create(),
  );

  static get() {
    return Services.#instance;
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

  async activityUpdated(activity) {
    console.debug('Activity updated:', activity);
    this.#store.dispatch({ type: 'activity-updated', activity });
  }

  async logActivity() {
    const activity = { ...this.#store.getState().currentActivity };
    console.debug('Log activity:', activity);
    activity.timestamp = this.#clock.date();
    await this.#api.logActivity(activity);
    this.#store.dispatch({ type: 'activity-logged', activity });
  }

  async selectRecentActivities() {
    console.debug('Select recent activities');
    const recentActivities = await this.#api.selectRecentActivities();
    this.#store.dispatch({
      type: 'recent-activities-selected',
      recentActivities,
    });
  }

  async askPeriodically({ period }) {
    console.debug('Ask periodically:', period);
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
    console.debug('Stop asking periodically');
    this.#timer.cancel();
    this.#store.dispatch({ type: 'countdown-stopped' });
  }
}
