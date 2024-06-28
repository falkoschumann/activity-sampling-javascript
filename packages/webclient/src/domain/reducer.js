import { Duration } from '@activity-sampling/shared';

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
    isFormDisabled: false,
    countdown: {
      isRunning: false,
      period: new Duration('PT30M'),
      remainingTime: new Duration('PT30M'),
    },
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
    case 'activity-selected':
      return activitySelected(state, action);
    case 'countdown-started':
      return countdownStarted(state, action);
    case 'countdown-progressed':
      return countdownProgressed(state, action);
    case 'countdown-stopped':
      return countdownStopped(state, action);
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    default:
      return state;
  }
}

function activityUpdated(state, { name, value }) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity: {
        ...state.currentActivity.activity,
        [name]: value,
      },
    },
  };
}

function activityLogged(state, { activity }) {
  let isFormDisabled = state.currentActivity.isFormDisabled;
  if (state.currentActivity.countdown.isRunning) {
    isFormDisabled = true;
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      activity,
      isFormDisabled,
    },
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

function countdownStarted(state, { period }) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isFormDisabled: true,
      countdown: {
        isRunning: true,
        period,
        remainingTime: new Duration(period),
      },
    },
  };
}

function countdownProgressed(state, { timestamp, duration }) {
  let remainingTime = new Duration(
    state.currentActivity.countdown.remainingTime,
  );
  remainingTime.minus(duration);
  const elapsed = remainingTime.isZero || remainingTime.isNegative;
  if (remainingTime.isNegative) {
    remainingTime = new Duration(state.currentActivity.countdown.period).minus(
      remainingTime.absolutized(),
    );
  }
  let isFormDisabled = state.currentActivity.isFormDisabled;
  if (elapsed) {
    isFormDisabled = false;
    duration = new Duration(state.currentActivity.countdown.period);
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
      countdown: {
        ...state.currentActivity.countdown,
        remainingTime,
      },
    },
  };
}

function countdownStopped(state) {
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      isFormDisabled: false,
      countdown: {
        ...state.currentActivity.countdown,
        isRunning: false,
        remainingTime: Duration.zero(),
      },
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
      activity: lastActivity,
    },
    recentActivities,
  };
}
