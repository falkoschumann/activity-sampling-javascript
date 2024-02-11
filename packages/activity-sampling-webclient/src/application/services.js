/**
 * @typedef {import('../util/store.js').Store} Store
 * @typedef {import('../infrastructure/api.js').Api} Api
 */

export async function startTimer(/** @type {Store} */ store, timer) {
  timer.start();
  store.dispatch({ type: 'timer-started' });
}

export async function stopTimer(/** @type {Store} */ store, timer) {
  timer.stop();
  store.dispatch({ type: 'timer-stopped' });
}

export async function timerTicked({ duration }, /** @type {Store} */ store) {
  store.dispatch({ type: 'timer-ticked', duration });
}

export async function activityUpdated(
  { name, value },
  /** @type {Store} */ store,
) {
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function setActivity(
  { client, project, task, notes },
  /** @type {Store} */ store,
) {
  store.dispatch({
    type: 'set-activity',
    client,
    project,
    task,
    notes,
  });
}

export async function logActivity(
  { timestamp = new Date() } = {},
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  let duration = store.getState().activityForm.duration;
  let { client, project, task, notes } = store.getState().activityForm;
  let activity = { timestamp, duration, client, project, task, notes };
  await api.logActivity(activity);
  store.dispatch({ type: 'activity-logged' });
}

export async function getRecentActivities(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  let recentActivities = await api.getRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}

export async function getHoursWorked(
  /** @type {Store} */ store,
  /** @type {Api} */ api,
) {
  let hoursWorked = await api.getHoursWorked();
  store.dispatch({ type: 'hours-worked-loaded', hoursWorked });
}

export default {
  startTimer,
  stopTimer,
  timerTicked,
  activityUpdated,
  setActivity,
  logActivity,
  getRecentActivities,
  getHoursWorked,
};
