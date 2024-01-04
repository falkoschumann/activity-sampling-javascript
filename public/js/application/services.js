export async function startTimer(store, timer) {
  timer.start();
  store.dispatch({ type: 'timer-started' });
}

export async function stopTimer(store, timer) {
  timer.stop();
  store.dispatch({ type: 'timer-stopped' });
}

export async function timerTicked({ duration }, store) {
  store.dispatch({ type: 'timer-ticked', duration });
}

export async function activityUpdated({ name, value }, store) {
  store.dispatch({ type: 'activity-updated', name, value });
}

export async function setActivity({ client, project, task, notes }, store) {
  store.dispatch({
    type: 'set-activity',
    client,
    project,
    task,
    notes,
  });
}

export async function logActivity({ timestamp = new Date() } = {}, store, api) {
  let duration = store.getState().activityForm.duration;
  let { client, project, task, notes } = store.getState().activityForm;
  let activity = { timestamp, duration, client, project, task, notes };
  await api.postLogActivity(activity);
  store.dispatch({ type: 'activity-logged' });
}

export async function getRecentActivities(store, api) {
  let recentActivities = await api.getRecentActivities();
  store.dispatch({ type: 'recent-activities-loaded', recentActivities });
}
