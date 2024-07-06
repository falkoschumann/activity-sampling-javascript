import { Duration } from '@activity-sampling/utils';

export const initialState = {
  currentActivity: {
    activity: {
      timestamp: undefined,
      duration: new Duration('PT30M'),
      client: '',
      project: '',
      task: '',
      notes: '',
    },
    isSubmitDisabled: true,
    isFormDisabled: false,
  },
  countdown: {
    isRunning: false,
    period: new Duration('PT30M'),
    remainingTime: new Duration('PT30M'),
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
    case 'activity-updated':
      return activityUpdated(state, action);
    case 'activity-logged':
      return activityLogged(state, action);
    case 'recent-activities-selected':
      return recentActivitiesSelected(state, action);
    case 'countdown-started':
      return countdownStarted(state, action);
    case 'countdown-progressed':
      return countdownProgressed(state, action);
    case 'countdown-stopped':
      return countdownStopped(state, action);
    default:
      return state;
  }
}

function activityUpdated(state, { activity }) {
  const newState = {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity: { ...state.currentActivity.activity, ...activity },
    },
  };
  return updateForm(newState);
}

function activityLogged(state, { activity }) {
  const newState = {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity,
    },
  };
  return updateForm(newState);
}

function recentActivitiesSelected(state, { recentActivities }) {
  let currentActivity = { ...initialState.currentActivity };
  const lastActivity = recentActivities.workingDays[0]?.activities[0];
  if (lastActivity != null) {
    currentActivity = { ...currentActivity, activity: lastActivity };
  }
  const newState = {
    ...state,
    currentActivity,
    recentActivities,
  };
  return updateForm(newState);
}

function countdownStarted(state, { period }) {
  const newState = {
    ...state,
    countdown: {
      isRunning: true,
      period,
      remainingTime: new Duration(period),
    },
  };
  return updateForm(newState);
}

function countdownProgressed(state, { timestamp, duration }) {
  let remainingTime = new Duration(state.countdown.remainingTime);
  remainingTime.minus(duration);
  const elapsed = remainingTime.isZero || remainingTime.isNegative;
  if (remainingTime.isNegative) {
    remainingTime = new Duration(state.countdown.period).minus(
      remainingTime.absolutized(),
    );
  }
  let isFormDisabled = state.currentActivity.isFormDisabled;
  if (elapsed) {
    // TODO enable submit
    isFormDisabled = false;
    duration = new Duration(state.countdown.period);
  } else {
    ({ timestamp, duration } = state.currentActivity.activity);
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity: {
        ...state.currentActivity.activity,
        timestamp,
        duration,
      },
      isFormDisabled,
    },
    countdown: {
      ...state.countdown,
      remainingTime,
    },
  };
}

function countdownStopped(state) {
  const newState = {
    ...state,
    countdown: {
      ...state.countdown,
      isRunning: false,
      remainingTime: Duration.zero(),
    },
  };
  return updateForm(newState);
}

function updateForm(state) {
  const isFormDisabled = state.countdown.isRunning;

  const activity = state.currentActivity.activity;
  const isSubmitDisabled =
    isFormDisabled ||
    activity.client.trim().length === 0 ||
    activity.project.trim().length === 0 ||
    activity.task.trim().length === 0;

  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isSubmitDisabled,
      isFormDisabled,
    },
  };
}
