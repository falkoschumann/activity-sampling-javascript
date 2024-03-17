/**
 * @typedef {import('../util/store.js').Store} Store
 * @typedef {import('../infrastructure/api.js').Api} Api
 * @typedef {import('../infrastructure/clock.js').Clock} Clock
 * * @typedef {import('../infrastructure/timer.js').Timer} Timer
 */

import { Duration } from 'activity-sampling-shared';

export async function activityUpdated(
  { name, value },
  /** @type {Store} */ store,
) {
  console.log('activityUpdated', { name, value });
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function logActivity(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
  /** @type {Clock} */ clock,
) {
  console.log('logActivity');
  let activity = { ...store.getState().currentActivity.activity };
  if (!activity.timestamp) {
    activity.timestamp = clock.date();
  }
  await api.logActivity(activity);
  store.dispatch({ type: 'activity-logged', activity });
}

export async function activitySelected(
  { client, project, task, notes },
  /** @type {Store} */ store,
) {
  console.log('activitySelected', { client, project, task, notes });
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
  /** @type {Clock} */ clock,
) {
  console.log('askPeriodically', { period });
  timer.schedule(() => {
    const timestamp = clock.date();
    const duration = new Duration('PT1S');
    console.log('countdown-progressed', timestamp, duration);
    store.dispatch({
      type: 'countdown-progressed',
      timestamp,
      duration,
    });
  }, 1000);
  store.dispatch({ type: 'countdown-started', period });
}

export function stopAskingPeriodically(store, timer) {
  console.log('stopAskingPeriodically');
  timer.cancel();
  store.dispatch({ type: 'countdown-stopped' });
}

export async function selectRecentActivities(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  console.log('selectRecentActivities');
  let recentActivities = await api.loadRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}

export async function selectHoursWorked(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  console.log('selectHoursWorked');
  let hoursWorked = await api.loadHoursWorked();
  store.dispatch({ type: 'hours-worked-loaded', hoursWorked });
}
