export const initialState = {
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
    case 'recent-activities-loaded':
      return recentActivitiesLoaded(state, action);
    default:
      return state;
  }
}

function recentActivitiesLoaded(state, action) {
  return { ...state, recentActivities: action.recentActivities };
}
