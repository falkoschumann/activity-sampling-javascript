import { Duration } from '@activity-sampling/utils';
import { RecentActivities, TimeSummary } from '@activity-sampling/domain';
import {
  ensureNonEmpty,
  ensureType,
} from '@activity-sampling/utils/src/validation.js';

export function determineRecentActivities(activities, today = new Date()) {
  const workingDays = determineWorkingDays(activities, today);
  const timeSummary = determineTimeSummary(activities, today);
  return RecentActivities.create({ workingDays, timeSummary });
}

export function determineWorkingDays(activities, today = new Date()) {
  const period = 30 * 24 * 60 * 60 * 1000; // 30 days
  const startDate = toDate(new Date(today - period));
  const days = [];
  for (const activity of activities) {
    const date = toDate(activity.timestamp);
    if (date < startDate) {
      continue;
    }

    let day = days.find((d) => equalsDate(d.date, date));
    if (day == null) {
      day = WorkingDay.create({ date });
      days.push(day);
      days.sort((a, b) => b.date - a.date);
    }
    day.add(activity);
  }
  return days;
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

export function determineTimeSummary(activities, today = new Date()) {
  const hoursYesterday = new Duration();
  const hoursToday = new Duration();
  const hoursThisWeek = new Duration();
  const hoursThisMonth = new Duration();
  for (const activity of activities) {
    if (isSameDay(activity.timestamp, today)) {
      hoursToday.plus(activity.duration);
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(activity.timestamp, yesterday)) {
      hoursYesterday.plus(activity.duration);
    }
    if (isSameWeek(activity.timestamp, today)) {
      hoursThisWeek.plus(activity.duration);
    }
    if (isSameMonth(activity.timestamp, today)) {
      hoursThisMonth.plus(activity.duration);
    }
  }
  return TimeSummary.create({
    hoursYesterday,
    hoursToday,
    hoursThisWeek,
    hoursThisMonth,
  });
}

function toDate(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date;
}

function equalsDate(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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

  const day1 = date1.getDay();
  const day2 = date2.getDay();
  if (day1 === boundaryDay) {
    return true;
  }
  if (day2 === boundaryDay) {
    return false;
  }

  const d1BoundaryDist = (day1 - boundaryDay + 7) % 7;
  const d2BoundaryDist = (day2 - boundaryDay + 7) % 7;
  return d1BoundaryDist <= d2BoundaryDist;
}

function isSameMonth(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
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

  static createTestInstance({
    timestamp = new Date('2024-06-20T10:30Z'),
    duration = new Duration('PT30M'),
    client = 'Test client',
    project = 'Test project',
    task = 'Test task',
    notes = 'Test notes',
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

  validate() {
    const dto = ensureType(
      this,
      {
        timestamp: Date,
        duration: Duration,
        client: String,
        project: String,
        task: String,
        notes: [String, undefined],
      },
      { name: 'ActivityLogged' },
    );
    ensureNonEmpty(this.client, { name: 'ActivityLogged.client' });
    ensureNonEmpty(this.project, { name: 'ActivityLogged.project' });
    ensureNonEmpty(this.task, { name: 'ActivityLogged.task' });
    ensureNonEmpty(this.notes, { name: 'ActivityLogged.notes' });
    return ActivityLogged.create(dto);
  }
}
