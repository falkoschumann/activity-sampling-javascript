import { Duration } from 'activity-sampling-shared';

export const initialState = {
  currentActivity: {
    // TODO activity: {}
    timestamp: undefined,
    duration: new Duration('PT30M'),
    client: '',
    project: '',
    task: '',
    notes: '',
    isFormDisabled: false,
    countdown: {
      isRunning: false,
      remainingTime: new Duration('PT30M'),
      progress: 0.0,
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
  hoursWorked: {
    report: [],
    totalHours: new Duration(),
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
    case 'hours-worked-loaded':
      return hoursWorkedLoaded(state, action);
    default:
      return state;
  }
}

function activityUpdated(state, { name, value }) {
  return {
    ...state,
    currentActivity: { ...state.currentActivity, [name]: value },
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
      ...activity,
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
        progress: 0.0,
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
  const progress = 1 - remainingTime / state.currentActivity.countdown.period;
  let isFormDisabled = state.currentActivity.isFormDisabled;
  if (elapsed) {
    isFormDisabled = false;
    duration = new Duration(state.currentActivity.countdown.period);
  } else {
    timestamp = state.currentActivity.timestamp;
    duration = state.currentActivity.duration;
  }
  return {
    ...state,
    currentActivity: {
      ...state.currentActivity,
      timestamp,
      duration,
      isFormDisabled,
      countdown: {
        ...state.currentActivity.countdown,
        remainingTime,
        progress,
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
        progress: 0.0,
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
      ...lastActivity,
    },
    recentActivities,
  };
}

function hoursWorkedLoaded(state, { hoursWorked }) {
  return { ...state, hoursWorked };
}
