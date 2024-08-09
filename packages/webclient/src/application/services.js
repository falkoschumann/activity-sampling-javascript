import { Clock, Duration, Timer, createStore } from '@activity-sampling/utils';
import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { NotificationAdapter } from '../infrastructure/notification-adapter.js';

export class Services {
  /** @type {Services} */ static #instance;

  static get() {
    if (Services.#instance == null) {
      Services.#instance = new Services(
        undefined,
        Api.create(),
        NotificationAdapter.create(),
        Timer.create(),
        Clock.create(),
      );
    }

    return Services.#instance;
  }

  #api;
  #notificationAdapter;
  #timer;
  #store;
  #clock;

  constructor(
    preloadedState,
    /** @type {Api} */ api,
    /** @type {NotificationAdapter} */ notificationAdapter,
    /** @type {Timer} */ timer,
    /** @type {Clock} */ clock,
  ) {
    this.#api = api;
    this.#notificationAdapter = notificationAdapter;
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
    let activity = this.#store.getState().currentActivity.activity;
    activity = { ...activity, timestamp: this.#clock.date() };
    console.debug('Log activity:', activity);
    await this.#api.logActivity(activity);
    await this.#notificationAdapter.close();
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
    this.#timer.schedule(async () => {
      const previousRemainingTime =
        this.#store.getState().countdown.remainingTime;

      const timestamp = this.#clock.date();
      const duration = new Duration('PT1S');
      this.#store.dispatch({
        type: 'countdown-progressed',
        timestamp,
        duration,
      });

      const remainingTime = this.#store.getState().countdown.remainingTime;
      if (remainingTime <= 0 && previousRemainingTime > 0) {
        await this.#notificationAdapter.show('What are you working on?', {
          icon: '/images/app-icon-256.png',
          requireInteraction: true,
          silent: false,
        });
      }
    }, 1000);
    this.#store.dispatch({ type: 'countdown-started', period });
  }

  async stopAskingPeriodically() {
    console.debug('Stop asking periodically');
    this.#timer.cancel();
    this.#store.dispatch({ type: 'countdown-stopped' });
  }
}
