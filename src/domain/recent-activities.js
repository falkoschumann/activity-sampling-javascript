import { Duration } from '../../public/js/domain/duration.js';

export function createRecentActivities(activities = [], today = new Date()) {
  return {
    workingDays: createWorkingDays(activities),
    timeSummary: createTimeSummary(activities, today),
  };
}

function createWorkingDays(activities = []) {
  let builder = new WorkingDaysBuilder();
  for (let activity of activities) {
    builder.add(activity);
  }
  return builder.get();
}

class WorkingDaysBuilder {
  #workingDays = [];

  add(activity) {
    let day = this.#getWorkingDayByDate(activity.timestamp);
    this.#addActivityToWorkingDay(activity, day);
  }

  get() {
    return this.#workingDays;
  }

  #getWorkingDayByDate(date) {
    let day = this.#workingDays.find((d) => equalsDate(d.date, date));
    return day ?? this.#addWorkingDay(toDate(date));
  }

  #addWorkingDay(date) {
    let day = { date, activities: [] };
    this.#workingDays.push(day);
    this.#workingDays.sort((a, b) => b.date - a.date);
    return day;
  }

  #addActivityToWorkingDay(activity, day) {
    day.activities.push(activity);
    day.activities.sort((a, b) => b.timestamp - a.timestamp);
  }
}

function createTimeSummary(activities = [], today = new Date()) {
  let builder = new TimeSummaryBuilder(today);
  for (let activity of activities) {
    builder.add(activity);
  }
  return builder.get();
}

class TimeSummaryBuilder {
  #today;

  #timeSummary = {
    hoursToday: new Duration(),
    hoursYesterday: new Duration(),
    hoursThisWeek: new Duration(),
    hoursThisMonth: new Duration(),
  };

  constructor(today = new Date()) {
    this.#today = today;
  }

  add(activity) {
    this.#addActivityToHoursToday(activity);
    this.#addActivityToHoursYesterday(activity);
    this.#addActivityToHoursThisWeek(activity);
    this.#addActivityToHoursThisMonth(activity);
  }

  get() {
    return this.#timeSummary;
  }

  #addActivityToHoursToday(activity) {
    if (isToday(activity.timestamp, this.#today)) {
      this.#timeSummary.hoursToday.plus(activity.duration);
    }
  }

  #addActivityToHoursYesterday(activity) {
    if (isYesterday(activity.timestamp, this.#today)) {
      this.#timeSummary.hoursYesterday.plus(activity.duration);
    }
  }

  #addActivityToHoursThisWeek(activity) {
    if (isThisWeek(activity.timestamp, this.#today)) {
      this.#timeSummary.hoursThisWeek.plus(activity.duration);
    }
  }

  #addActivityToHoursThisMonth(activity) {
    if (isThisMonth(activity.timestamp, this.#today)) {
      this.#timeSummary.hoursThisMonth.plus(activity.duration);
    }
  }
}

function toDate(date) {
  date = new Date(date);
  date.setHours(0, 0, 0, 0);
  return date;
}

function equalsDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isToday(date, today = new Date()) {
  return equalsDate(date, today);
}

function isYesterday(date, today = new Date()) {
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return equalsDate(date, yesterday);
}

function isThisWeek(date, today = new Date(), boundaryDay = 1) {
  return toDate(date) <= toDate(today) && isSameWeek(date, today, boundaryDay);
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

function isThisMonth(date, today = new Date()) {
  return toDate(date) <= toDate(today) && date.getMonth() === today.getMonth();
}
