import { Duration } from './duration.js';

export const initialState = {
  activityForm: {
    timestamp: undefined,
    duration: undefined,
    client: '',
    project: '',
    task: '',
    notes: '',
    formDisabled: false,
    logButtonDisabled: false,
  },
  currentTask: {
    duration: new Duration('PT30M'),
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
      return timerStarted(state, action);
    case 'timer-stopped':
      return timerStopped(state, action);
    case 'timer-ticked':
      return timerTicked(state, action);
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

function timerStarted(state) {
  return {
    ...state,
    currentTask: { ...state.currentTask, isTimerRunning: true },
  };
}

function timerStopped(state) {
  return {
    ...state,
    currentTask: {
      ...state.currentTask,
      remainingTime: state.currentTask.duration,
      progress: 0,
      isTimerRunning: false,
    },
  };
}

function timerTicked(state, { duration }) {
  let remainingTime = new Duration(state.currentTask.remainingTime - duration);
  let currentTask = {
    ...state.currentTask,
    remainingTime,
    progress: 1.0 - remainingTime / state.currentTask.duration,
  };
  let activityForm = state.activityForm;
  if (remainingTime <= 0) {
    activityForm = {
      ...activityForm,
      duration: currentTask.duration,
      formDisabled: false,
    };
  }
  return { ...state, activityForm, currentTask };
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
      logButtonDisabled: true,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  return { ...state, recentActivities };
}
