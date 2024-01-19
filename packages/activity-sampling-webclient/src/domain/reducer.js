import { Duration } from 'activity-sampling-shared';

export const initialState = {
  activityForm: {
    timestamp: undefined,
    duration: new Duration('PT30M'),
    client: '',
    project: '',
    task: '',
    notes: '',
    isFormDisabled: false,
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
    case 'hours-worked-loaded':
      return hoursWorkedLoaded(state, action);
    default:
      return state;
  }
}

function timerStarted(state) {
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      isFormDisabled: true,
      remainingTime: state.activityForm.duration,
      progress: 0,
      isTimerRunning: true,
    },
  };
}

function timerStopped(state) {
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      isFormDisabled: false,
      remainingTime: state.activityForm.duration,
      progress: 0,
      isTimerRunning: false,
    },
  };
}

function timerTicked(state, { duration }) {
  let isFormDisabled = state.activityForm.isFormDisabled;
  let remainingTime = new Duration(state.activityForm.remainingTime - duration);
  let progress = 1 - remainingTime / state.activityForm.duration;
  if (remainingTime <= 0) {
    isFormDisabled = false;
    remainingTime = state.activityForm.duration;
    progress = 0;
  }
  let activityForm = {
    ...state.activityForm,
    isFormDisabled,
    remainingTime,
    progress,
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
  let isFormDisabled = state.activityForm.isFormDisabled;
  if (state.activityForm.isTimerRunning) {
    isFormDisabled = true;
  }
  return {
    ...state,
    activityForm: {
      ...state.activityForm,
      isFormDisabled,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  return { ...state, recentActivities };
}

function hoursWorkedLoaded(state, { hoursWorked }) {
  return { ...state, hoursWorked };
}
