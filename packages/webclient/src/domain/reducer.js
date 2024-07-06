import { Duration } from '@activity-sampling/utils';

export const initialState = {
  currentActivity: {
    timestamp: undefined,
    duration: new Duration('PT30M'),
    client: '',
    project: '',
    task: '',
    notes: '',
    // TODO add isSubmittable
  },
  isFormDisabled: false, // TODO move to currentActivity
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
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      ...activity,
    },
  };
}

function activityLogged(state, { activity }) {
  let isFormDisabled = state.isFormDisabled;
  if (state.countdown.isRunning) {
    isFormDisabled = true;
  }
  return {
    ...state,
    currentActivity: activity,
    isFormDisabled,
  };
}

function recentActivitiesSelected(state, { recentActivities }) {
  let currentActivity = { ...initialState.currentActivity };
  const lastActivity = recentActivities.workingDays[0]?.activities[0];
  if (lastActivity != null) {
    currentActivity = { ...currentActivity, ...lastActivity };
  }
  return {
    ...state,
    currentActivity,
    recentActivities,
  };
}

function countdownStarted(state, { period }) {
  return {
    ...state,
    isFormDisabled: true,
    countdown: {
      isRunning: true,
      period,
      remainingTime: new Duration(period),
    },
  };
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
  let isFormDisabled = state.isFormDisabled;
  if (elapsed) {
    isFormDisabled = false;
    duration = new Duration(state.countdown.period);
  } else {
    ({ timestamp, duration } = state.currentActivity);
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      timestamp,
      duration,
    },
    isFormDisabled,
    countdown: {
      ...state.countdown,
      remainingTime,
    },
  };
}

function countdownStopped(state) {
  return {
    ...state,
    isFormDisabled: false,
    countdown: {
      ...state.countdown,
      isRunning: false,
      remainingTime: Duration.zero(),
    },
  };
}
