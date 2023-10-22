export const initialState = {
  activity: {
    client: '',
    project: '',
    task: '',
    notes: '',
    logButtonDisabled: false,
  },
  task: {
    duration: 1800,
    remainingDuration: 1800,
    progress: 0,
  },
  recentActivities: {
    workingDays: [],
    timeSummary: {
      hoursToday: 0,
      hoursYesterday: 0,
      hoursThisWeek: 0,
      hoursThisMonth: 0,
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

function progressTicked(state, action) {
  let remainingDuration = state.task.remainingDuration - action.seconds;
  let task = {
    ...state.task,
    remainingDuration,
    progress: 1.0 - remainingDuration / state.task.duration,
  };
  return { ...state, task };
}

function activityUpdated(state, action) {
  return {
    ...state,
    activity: { ...state.activity, [action.name]: action.value },
  };
}

function setActivity(state, action) {
  return {
    ...state,
    activity: {
      client: action.client,
      project: action.project,
      task: action.task,
      notes: action.notes,
    },
  };
}

function activityLogged(state) {
  return {
    ...state,
    activity: {
      ...state.activity,
      logButtonDisabled: true,
    },
  };
}

function recentActivitiesLoaded(state, action) {
  return { ...state, recentActivities: action.recentActivities };
}
