/**
 * @typedef {import('../util/store.js').Store} Store
 * @typedef {import('../infrastructure/api.js').Api} Api
 * @typedef {import('../infrastructure/clock.js').Clock} Clock
 */

// TODO use Java Timer{schedule(), cancel()}?

export async function logActivity(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
  /** @type {Clock} */ clock,
) {
  console.log('logActivity');
  let { duration, client, project, task, notes } =
    store.getState().currentActivity;
  const activity = {
    timestamp: clock.date(),
    duration,
    client,
    project,
    task,
    notes,
  };
  await api.logActivity(activity);
  store.dispatch({ type: 'activity-logged' });
}

export async function notificationScheduled({ deliverIn }, store) {
  console.log('notificationScheduled', { deliverIn });
  store.dispatch({ type: 'notification-scheduled', deliverIn });
}

export async function countdownProgressed(
  { remaining },
  /** @type {Store} */ store,
) {
  console.log('countdownProgressed', { remaining });
  store.dispatch({ type: 'countdownProgressed', remaining });
}

export async function notificationAcknowledged(
  { client, project, task, notes },
  /** @type {Store} */ store,
) {
  console.log('notificationAcknowledged', { client, project, task, notes });
  store.dispatch({
    type: 'notification-acknowledged',
    client,
    project,
    task,
    notes,
  });
}

// TODO remove or rename
export async function stopTimer(/** @type {Store} */ store, timer) {
  console.log('stopTimer');
  timer.stop();
  store.dispatch({ type: 'timer-stopped' });
}

export async function activityUpdated(
  { name, value },
  /** @type {Store} */ store,
) {
  console.log('activityUpdated', { name, value });
  store.dispatch({ type: 'activity-updated', name, value });
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

export default {
  logActivity,
  notificationScheduled,
  notificationAcknowledged,
  countdownProgressed,
  activityUpdated,
  activitySelected,
  selectRecentActivities,
  selectHoursWorked,
};
