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
    isElapsed: false,
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
    countdown: {
      ...state.countdown,
      isElapsed: false,
    },
  };
  return updateForm(newState);
}

function recentActivitiesSelected(state, { recentActivities }) {
  let activity = { ...initialState.currentActivity.activity };
  const lastActivity = recentActivities.workingDays[0]?.activities[0];
  if (lastActivity != null) {
    activity = lastActivity;
  }
  const newState = {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity,
    },
    recentActivities,
  };
  return updateForm(newState);
}

function countdownStarted(state, { period }) {
  const newState = {
    ...state,
    countdown: {
      ...state.countdown,
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

  const isElapsed = state.countdown.isElapsed || remainingTime <= 0;
  if (isElapsed) {
    duration = new Duration(state.countdown.period);
  } else {
    ({ timestamp, duration } = state.currentActivity.activity);
  }

  if (remainingTime.isNegative) {
    remainingTime = new Duration(state.countdown.period).minus(
      remainingTime.absolutized(),
    );
  }

  const newState = {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity: {
        ...state.currentActivity.activity,
        timestamp,
        duration,
      },
    },
    countdown: {
      ...state.countdown,
      isElapsed,
      remainingTime,
    },
  };
  return updateForm(newState);
}

function countdownStopped(state) {
  const newState = {
    ...state,
    countdown: {
      ...state.countdown,
      isRunning: false,
      isElapsed: false,
    },
  };
  return updateForm(newState);
}

function updateForm(state) {
  const isFormDisabled =
    state.countdown.isRunning && !state.countdown.isElapsed;

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
