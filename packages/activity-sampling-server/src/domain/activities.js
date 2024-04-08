import { Duration } from 'activity-sampling-shared';

export class LogActivity {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new LogActivity(timestamp, duration, client, project, task, notes);
  }

  static createNull({
    timestamp = randomTimestamp(),
    duration = randomDuration(),
    client = randomClient(),
    project = randomProject(),
    task = randomTask(),
    notes = randomNotes(),
  } = {}) {
    return LogActivity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  constructor(
    /** @type {Date} */ timestamp,
    /** @type {Duration} */ duration,
    /** @type {string} */ client,
    /** @type {string} */ project,
    /** @type {string} */ task,
    /** @type {string} */ notes,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

export class RecentActivities {
  static create({ activities = [], today = new Date() } = {}) {
    const result = new RecentActivities(today);
    for (let activity of activities) {
      result.add(activity);
    }
    return result;
  }

  #startDate;
  /** @type {WorkingDay[]} */ workingDays = [];
  /** @type {TimeSummary} */ timeSummary;

  constructor(/** @type {Date} */ today) {
    this.#startDate = toDate(new Date(today - 30 * 24 * 60 * 60 * 1000));
    this.timeSummary = TimeSummary.create({ today });
  }

  add(activity) {
    if (activity.timestamp < this.#startDate) {
      return;
    }

    this.#addToWorkingDays(activity);
    this.timeSummary.add(activity);
  }

  #addToWorkingDays(activity) {
    const date = toDate(activity.timestamp);
    let day = this.workingDays.find((d) => equalsDate(d.date, date));
    if (day == null) {
      day = WorkingDay.create({ date });
      this.workingDays.push(day);
      this.workingDays.sort((a, b) => b.date - a.date);
    }
    day.add(activity);
  }
}

export class WorkingDay {
  static create({ date = new Date(), activities = [] } = {}) {
    return new WorkingDay(date, activities);
  }

  constructor(/** @type {Date} */ date, /** @type {Activity[]} */ activities) {
    this.date = date;
    this.activities = activities;
  }

  add(activity) {
    this.activities.push(activity);
    this.activities.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export class TimeSummary {
  static create({
    today = new Date(),
    hoursToday = new Duration(),
    hoursYesterday = new Duration(),
    hoursThisWeek = new Duration(),
    hoursThisMonth = new Duration(),
  } = {}) {
    return new TimeSummary(
      today,
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  #today;

  constructor(
    /** @type {Date} */ today,
    /** @type {Duration} */ hoursToday,
    /** @type {Duration} */ hoursYesterday,
    /** @type {Duration} */ hoursThisWeek,
    /** @type {Duration} */ hoursThisMonth,
  ) {
    this.#today = today;
    this.hoursToday = hoursToday;
    this.hoursYesterday = hoursYesterday;
    this.hoursThisWeek = hoursThisWeek;
    this.hoursThisMonth = hoursThisMonth;
  }

  add(activity) {
    this.#addActivityToHoursToday(activity);
    this.#addActivityToHoursYesterday(activity);
    this.#addActivityToHoursThisWeek(activity);
    this.#addActivityToHoursThisMonth(activity);
  }

  #addActivityToHoursToday(activity) {
    if (isToday(activity.timestamp, this.#today)) {
      this.hoursToday.plus(activity.duration);
    }
  }

  #addActivityToHoursYesterday(activity) {
    if (isYesterday(activity.timestamp, this.#today)) {
      this.hoursYesterday.plus(activity.duration);
    }
  }

  #addActivityToHoursThisWeek(activity) {
    if (isThisWeek(activity.timestamp, this.#today)) {
      this.hoursThisWeek.plus(activity.duration);
    }
  }

  #addActivityToHoursThisMonth(activity) {
    if (isThisMonth(activity.timestamp, this.#today)) {
      this.hoursThisMonth.plus(activity.duration);
    }
  }
}

function toDate(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date;
}

function equalsDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isToday(date, today) {
  return equalsDate(date, today);
}

function isYesterday(date, today) {
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return equalsDate(date, yesterday);
}

function isThisWeek(date, today, boundaryDay = 1) {
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

function isThisMonth(date, today) {
  return toDate(date) <= toDate(today) && date.getMonth() === today.getMonth();
}

export class ActivityLogged {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new ActivityLogged(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  static createNull({
    timestamp = randomTimestamp(),
    duration = randomDuration(),
    client = randomClient(),
    project = randomProject(),
    task = randomTask(),
    notes = randomNotes(),
  } = {}) {
    return ActivityLogged.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  constructor(
    /** @type {Date} */ timestamp,
    /** @type {Duration} */ duration,
    /** @type {string} */ client,
    /** @type {string} */ project,
    /** @type {string} */ task,
    /** @type {string} */ notes,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

export class Activity {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new Activity(timestamp, duration, client, project, task, notes);
  }

  static createNull({
    timestamp = randomTimestamp(),
    duration = randomDuration(),
    client = randomClient(),
    project = randomProject(),
    task = randomTask(),
    notes = randomNotes(),
  } = {}) {
    return Activity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  constructor(
    /** @type {Date} */ timestamp,
    /** @type {Duration} */ duration,
    /** @type {string} */ client,
    /** @type {string} */ project,
    /** @type {string} */ task,
    /** @type {string!} */ notes,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }
}

function randomTimestamp() {
  return new Date(Math.random() * Date.now());
}
function randomDuration() {
  return new Duration(Math.random() * 60 * 60 * 1000);
}

function randomClient() {
  return 'client-' + randomId();
}

function randomProject() {
  return 'project-' + randomId();
}

function randomTask() {
  return 'task-' + randomId();
}

function randomNotes() {
  if (Math.random() < 0.5) {
    return undefined;
  }

  return 'notes-' + randomId();
}

function randomId() {
  return crypto.randomUUID().substring(0, 8);
}
