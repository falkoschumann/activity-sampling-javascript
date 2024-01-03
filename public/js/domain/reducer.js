import { Duration } from './duration.js';

export const initialState = {
  activityForm: {
    timestamp: undefined,
    duration: new Duration('PT30M'),
    client: '',
    project: '',
    task: '',
    notes: '',
    isFormDisabled: false,
    isLogButtonDisabled: false,
    remainingTime: new Duration('PT30M'),
    progress: 0,
    isTimerRunning: false,
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

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'timer-started':
      return timerStarted(state);
    case 'timer-stopped':
      return timerStopped(state);
    case 'timer-ticked':
      return timerTicked(state, action);
    case 'activity-updated':
      return activityUpdated(state, action);
    case 'set-activity':
      return setActivity(state, action);
    case 'activity-logged':
      return activityLogged(state);
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    default:
      return state;
  }
}

function timerStarted(state) {
  return {
    ...state,
    activityForm: { ...state.activityForm, isTimerRunning: true },
  };
}

function timerStopped(state) {
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      remainingTime: state.activityForm.duration,
      progress: 0,
      isTimerRunning: false,
    },
  };
}

function timerTicked(state, { duration }) {
  let remainingTime = new Duration(state.activityForm.remainingTime - duration);
  let isFormDisabled = state.activityForm.isFormDisabled;
  if (remainingTime <= 0) {
    isFormDisabled = false;
  }
  let activityForm = {
    ...state.activityForm,
    isFormDisabled,
    remainingTime,
    progress: 1.0 - remainingTime / state.activityForm.duration,
  };
  return { ...state, activityForm };
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
    activityForm: { ...state.activityForm, client, project, task, notes },
  };
}

function activityLogged(state) {
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      isLogButtonDisabled: true,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  return { ...state, recentActivities };
}
