import { Duration } from 'activity-sampling-shared';

export const initialState = {
  activityForm: {
    client: '',
    project: '',
    task: '',
    notes: '',
    logButtonDisabled: false,
  },
  currentTask: {
    duration: new Duration('PT30M'),
    remainingTime: new Duration('PT30M'),
    progress: 0,
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
  let remainingTime = new Duration(state.currentTask.remainingTime - duration);
  let currentTask = {
    ...state.currentTask,
    remainingTime,
    progress: 1.0 - remainingTime / state.currentTask.duration,
  };
  return { ...state, currentTask };
}

function activityUpdated(state, { name, value }) {
  return {
    ...state,
    activityForm: { ...state.activityForm, [name]: value },
  };
}

function setActivity(state, { client, project, task, notes }) {
  return {
    ...state,
    activityForm: { client, project, task, notes },
  };
}

function activityLogged(state) {
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      logButtonDisabled: true,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  return { ...state, recentActivities };
}
