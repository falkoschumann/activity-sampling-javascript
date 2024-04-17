import { Duration } from '@activity-sampling/shared';

/**
 * @typedef {import('../util/store.js').Store} Store
 * @typedef {import('../infrastructure/activities-gateway.js').ActivitiesGateway} ActivitiesGateway
 * @typedef {import('../infrastructure/clock.js').Clock} Clock
 * @typedef {import('../infrastructure/timer.js').Timer} Timer
 */

export async function activityUpdated(
  { name, value },
  /** @type {Store} */ store,
) {
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function logActivity(
  /** @type {Store} */ store,
  /** @type {ActivitiesGateway} */ activitiesGateway,
  /** @type {Clock} */ clock,
) {
  let activity = { ...store.getState().currentActivity.activity };
  if (!activity.timestamp) {
    activity.timestamp = clock.date();
  }
  await activitiesGateway.logActivity(activity);
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
  /** @type {Clock} */ clock,
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
  /** @type {ActivitiesGateway} */ activitiesGateway,
) {
  let recentActivities = await activitiesGateway.loadRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}

export async function selectHoursWorked(
  /** @type {Store} */ store,
  /** @type {ActivitiesGateway} */ activitiesGateway,
) {
  let hoursWorked = await activitiesGateway.loadHoursWorked();
  store.dispatch({ type: 'hours-worked-loaded', hoursWorked });
}