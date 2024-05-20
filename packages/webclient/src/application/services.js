import { Clock, Duration, Timer, createStore } from '@activity-sampling/shared';
import { Api } from '../infrastructure/api.js';
import { reducer } from '../domain/reducer.js';

/**
 * @typedef {import('@activity-sampling/shared').Timer} Timer
 * @typedef {import('@activity-sampling/shared/src/store.js').Store} Store
 * @typedef {import('../infrastructure/api.js').Api} Api
 */

export class Services {
  static create() {
    return new Services(createStore(reducer), Api.create(), Timer.create());
  }

  static createNull() {
    return new Services(
      createStore(reducer),
      Api.createNull(),
      Timer.createNull(),
    );
  }

  constructor(
    /** @type {Store} */ store,
    /** @type {Api} */ api,
    /** @type {Timer} */ timer,
  ) {
    this.store = store;
    this.api = api;
    this.timer = timer;
  }
}

export async function activityUpdated(
  { name, value },
  /** @type {Store} */ store,
) {
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function logActivity(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
  clock = Clock.create(),
) {
  let activity = { ...store.getState().currentActivity.activity };
  if (!activity.timestamp) {
    activity.timestamp = clock.date();
  }
  await api.logActivity(activity);
  store.dispatch({ type: 'activity-logged', activity });
}

/** @deprecated */
export async function activitySelected(
  { client, project, task, notes },
  /** @type {Store} */ store,
) {
  store.dispatch({
    type: 'activity-selected',
    client,
    project,
    task,
    notes,
  });
}

export async function askPeriodically(
  { period },
  /** @type {Store} */ store,
  /** @type {Timer} */ timer,
  clock = Clock.create(),
) {
  timer.schedule(() => {
    const timestamp = clock.date();
    const duration = new Duration('PT1S');
    store.dispatch({
      type: 'countdown-progressed',
      timestamp,
      duration,
    });
  }, 1000);
  store.dispatch({ type: 'countdown-started', period });
}

export function stopAskingPeriodically(store, timer) {
  timer.cancel();
  store.dispatch({ type: 'countdown-stopped' });
}

export async function selectRecentActivities(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  let recentActivities = await api.loadRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}

export async function selectHoursWorked(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  let hoursWorked = await api.loadHoursWorked();
  store.dispatch({ type: 'hours-worked-loaded', hoursWorked });
}
