export function createRecentActivities(activities = []) {
  let workingDays = [];
  for (let activity of activities) {
    addActivity(activity);
  }
  return { workingDays };

  function addActivity(activity) {
    let day = getWorkingDayByDate(activity.timestamp);
    addActivityToWorkingDay(activity, day);
  }

  function getWorkingDayByDate(date) {
    let day = workingDays.find(
      (d) =>
        d.date.getFullYear() === date.getFullYear() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getDate() === date.getDate(),
    );
    return day ?? addWorkingDay(toUTCDate(date));
  }

  function addWorkingDay(date) {
    let day = { date, activities: [] };
    workingDays.push(day);
    workingDays.sort((a, b) => b.date - a.date);
    return day;
  }

  function addActivityToWorkingDay(activity, day) {
    day.activities.push(activity);
    day.activities.sort((a, b) => b.timestamp - a.timestamp);
  }
}

function toUTCDate(date) {
  date = new Date(date);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
