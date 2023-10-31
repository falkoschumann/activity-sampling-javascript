import { Duration } from 'activity-sampling-shared';

export const initialState = {
  task: {
    duration: new Duration(1800),
    remainingDuration: new Duration(1800),
    progress: 0,
  },
  activity: {
    client: '',
    project: '',
    task: '',
    notes: '',
    logButtonDisabled: false,
  },
  recentActivities: {
    workingDays: [],
    timeSummary: {
      hoursToday: new Duration(),
      hoursYesterday: new Duration(),
      hoursThisWeek: new Duration(),
      hoursThisMonth: new Duration(),
    },
  },
};

export function reducer(state, action) {
  switch (action.type) {
    case 'progress-ticked':
      return progressTicked(state, action);
    case 'activity-updated':
      return activityUpdated(state, action);
    case 'set-activity':
      return setActivity(state, action);
    case 'activity-logged':
      return activityLogged(state, action);
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    default:
      return state;
  }
}

function progressTicked(state, { duration }) {
  let remainingDuration = new Duration(state.task.remainingDuration - duration);
  let task = {
    ...state.task,
    remainingDuration,
    progress: 1.0 - remainingDuration / state.task.duration,
  };
  return { ...state, task };
}

function activityUpdated(state, { name, value }) {
  return {
    ...state,
    activity: { ...state.activity, [name]: value },
  };
}

function setActivity(state, { client, project, task, notes }) {
  return {
    ...state,
    activity: { client, project, task, notes },
  };
}

function activityLogged(state) {
  return {
    ...state,
    activity: {
      ...state.activity,
      logButtonDisabled: true,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  return { ...state, recentActivities };
}
