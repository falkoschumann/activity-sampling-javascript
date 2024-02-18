import { Duration } from 'activity-sampling-shared';

export const initialState = {
  currentActivity: {
    timestamp: undefined,
    duration: new Duration('PT30M'),
    client: '',
    project: '',
    task: '',
    notes: '',
    isFormDisabled: false,
    remainingTime: new Duration('PT30M'),
    progress: 0,
    isTimerRunning: false, // TODO rename to isCountdownRunning
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
  hoursWorked: {
    report: [],
    totalHours: new Duration(),
  },
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case 'notification-scheduled':
      return notificationScheduled(state, action);
    case 'countdown-progressed':
      return countdownProgressed(state, action);
    case 'notification-acknowledged':
      return notificationAcknowledged(state, action);
    case 'timer-stopped':
      return timerStopped(state, action);
    case 'activity-updated':
      return activityUpdated(state, action);
    case 'activity-selected':
      return activitySelected(state, action);
    case 'activity-logged':
      return activityLogged(state, action);
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    case 'hours-worked-loaded':
      return hoursWorkedLoaded(state, action);
    default:
      return state;
  }
}

function notificationScheduled(state, { deliverIn }) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isFormDisabled: true,
      remainingTime: new Duration(deliverIn),
      progress: 0,
      isTimerRunning: true,
    },
  };
}

function countdownProgressed(state, { remaining }) {
  let remainingTime = new Duration(remaining);
  let progress = 1 - remainingTime / state.currentActivity.duration;
  let currentActivity = {
    ...state.currentActivity,
    remainingTime,
    progress,
  };
  return { ...state, currentActivity };
}

function notificationAcknowledged(state, { client, project, task, notes }) {
  const isFormDisabled = state.currentActivity.isTimerRunning;
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      client,
      project,
      task,
      notes,
      isFormDisabled,
    },
  };
}

function timerStopped(state) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isFormDisabled: false,
      remainingTime: state.currentActivity.duration,
      progress: 0,
      isTimerRunning: false,
    },
  };
}

function activityUpdated(state, { name, value }) {
  return {
    ...state,
    currentActivity: { ...state.currentActivity, [name]: value },
  };
}

function activitySelected(state, { client, project, task, notes }) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity: {
        ...state.currentActivity.activity,
        client,
        project,
        task,
        notes,
      },
    },
  };
}

function activityLogged(state) {
  let isFormDisabled = state.currentActivity.isFormDisabled;
  if (state.currentActivity.isTimerRunning) {
    isFormDisabled = true;
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isFormDisabled,
    },
  };
}

function recentActivitiesLoaded(state, { recentActivities }) {
  let lastActivity = recentActivities.workingDays[0]?.activities[0];
  if (!lastActivity) {
    lastActivity = {
      timestamp: undefined,
      client: '',
      project: '',
      task: '',
      notes: '',
    };
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      ...lastActivity,
    },
    recentActivities,
  };
}

function hoursWorkedLoaded(state, { hoursWorked }) {
  return { ...state, hoursWorked };
}
