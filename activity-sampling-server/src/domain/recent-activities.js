import { Duration } from 'activity-sampling-shared';

// TODO: move to client because local time zone of user is relevant

export function createRecentActivities(activities = [], today = new Date()) {
  let workingDays = [];
  let timeSummary = {
    hoursToday: new Duration(),
    hoursYesterday: new Duration(),
    hoursThisWeek: new Duration(),
    hoursThisMonth: new Duration(),
  };
  for (let activity of activities) {
    addActivity(activity);
  }
  return { workingDays, timeSummary };

  function addActivity(activity) {
    let day = getWorkingDayByDate(activity.timestamp);
    addActivityToWorkingDay(activity, day);
    addActivityToTimeSummary(activity);
  }

  function getWorkingDayByDate(date) {
    let day = workingDays.find(
      (d) =>
        d.date.getFullYear() === date.getFullYear() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getDate() === date.getDate(),
    );
    return day ?? addWorkingDay(toDate(date));
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

  function addActivityToTimeSummary(activity) {
    addActivityToHoursToday(activity);
    addActivityToHoursYesterday(activity);
    addActivityToHoursThisWeek(activity);
    addActivityToHoursThisMonth(activity);
  }

  function addActivityToHoursToday(activity) {
    if (isToday(activity.timestamp, today)) {
      timeSummary.hoursToday.plus(activity.duration);
    }
  }

  function addActivityToHoursYesterday(activity) {
    if (isYesterday(activity.timestamp, today)) {
      timeSummary.hoursYesterday.plus(activity.duration);
    }
  }

  function addActivityToHoursThisWeek(activity) {
    if (isThisWeek(activity.timestamp, today)) {
      timeSummary.hoursThisWeek.plus(activity.duration);
    }
  }

  function addActivityToHoursThisMonth(activity) {
    if (isThisMonth(activity.timestamp, today)) {
      timeSummary.hoursThisMonth.plus(activity.duration);
    }
  }
}

function toDate(date) {
  date = new Date(date);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isEqualDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isSameWeek(date1, date2, boundaryDay = 1) {
  if (date1 > date2) {
    [date1, date2] = [date2, date1];
  }

  date1 = toDate(date1);
  date2 = toDate(date2);

  if ((date2 - date1) / 1000 / 60 / 60 / 24 > 6) {
    return false;
  }

  let day1 = date1.getDay();
  let day2 = date2.getDay();
  if (day1 === boundaryDay) {
    return true;
  }
  if (day2 === boundaryDay) {
    return false;
  }

  let d1BoundaryDist = (day1 - boundaryDay + 7) % 7;
  let d2BoundaryDist = (day2 - boundaryDay + 7) % 7;
  return d1BoundaryDist <= d2BoundaryDist;
}

function isToday(date, today = new Date()) {
  return isEqualDate(date, today);
}

function isYesterday(date, today = new Date()) {
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isEqualDate(date, yesterday);
}

function isThisWeek(date, today = new Date(), boundaryDay = 1) {
  return date <= today && isSameWeek(date, today, boundaryDay);
}

function isThisMonth(date, today = new Date()) {
  return date <= today && date.getMonth() === today.getMonth();
}
