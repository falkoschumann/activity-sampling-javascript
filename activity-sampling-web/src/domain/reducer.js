export const initialState = {
  activity: {
    client: '',
    project: '',
    task: '',
    notes: '',
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
    case 'activity-updated':
      return activityUpdated(state, action);
    case 'set-activity':
      return setActivity(state, action);
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    default:
      return state;
  }
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

function recentActivitiesLoaded(state, action) {
  return { ...state, recentActivities: action.recentActivities };
}
