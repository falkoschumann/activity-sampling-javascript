import {
  Duration,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/shared';

// TODO extract domain package
// TODO treat messages as DTOs with validation

export class LogActivity {
  static create({ timestamp, duration, client, project, task, notes } = {}) {
    return new LogActivity(timestamp, duration, client, project, task, notes);
  }

  static createTestInstance({
    timestamp = new Date('2024-06-20T10:30Z'),
    duration = new Duration('PT30M'),
    client = 'Test client',
    project = 'Test project',
    task = 'Test task',
    notes = 'Test notes',
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

  validate() {
    const timestamp = validateRequiredProperty(
      this,
      'LogActivity',
      'timestamp',
      Date,
    );
    const duration = validateRequiredProperty(
      this,
      'LogActivity',
      'duration',
      Duration,
    );
    const client = validateRequiredProperty(
      this,
      'LogActivity',
      'client',
      'string',
    );
    const project = validateRequiredProperty(
      this,
      'LogActivity',
      'project',
      'string',
    );
    const task = validateRequiredProperty(
      this,
      'LogActivity',
      'task',
      'string',
    );
    const notes = validateOptionalProperty(
      this,
      'LogActivity',
      'notes',
      'string',
    );
    return LogActivity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

export class RecentActivitiesQuery {
  static create({ today = new Date() } = {}) {
    return new RecentActivitiesQuery(today);
  }

  static createTestInstance({ today = new Date('2024-06-20T08:00Z') }) {
    return RecentActivitiesQuery.create({
      today,
    });
  }

  constructor(/** @type {Date} */ today) {
    this.today = today;
  }

  validate() {
    const today = validateOptionalProperty(
      this,
      'RecentActivitiesQuery',
      'today',
      Date,
    );
    return RecentActivitiesQuery.create({ today });
  }
}

export class RecentActivities {
  static create({ workingDays, timeSummary } = {}) {
    return new RecentActivities(workingDays, timeSummary);
  }

  static createTestInstance({
    workingDays = WorkingDay.createTestInstance(),
    timeSummary = TimeSummary.createTestInstance(),
  } = {}) {
    return new RecentActivities(workingDays, timeSummary);
  }

  constructor(
    /** @type {WorkingDay[]} */ workingDays = [],
    /** @type {TimeSummary} */ timeSummary,
  ) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }

  // TODO Implement validate()
}

export class WorkingDay {
  static create({ date = new Date(), activities = [] } = {}) {
    return new WorkingDay(date, activities);
  }

  static createTestInstance({
    date = new Date(),
    activities = [Activity.createTestInstance()],
  } = {}) {
    return WorkingDay.create({ date, activities });
  }

  constructor(/** @type {Date} */ date, /** @type {Activity[]} */ activities) {
    this.date = date;
    this.activities = activities;
  }

  // TODO Implement validate()
}

export class Activity {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new Activity(timestamp, duration, client, project, task, notes);
  }

  static createTestInstance({
    timestamp = new Date('2024-06-20T10:30Z'),
    duration = new Duration('PT30M'),
    client = 'Test client',
    project = 'Test project',
    task = 'Test task',
    notes = 'Test notes',
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

  // TODO Implement validate()
}

export class TimeSummary {
  static create({
    hoursToday = new Duration(),
    hoursYesterday = new Duration(),
    hoursThisWeek = new Duration(),
    hoursThisMonth = new Duration(),
  } = {}) {
    return new TimeSummary(
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    );
  }

  static createTestInstance({
    hoursToday = new Duration('PT30M'),
    hoursYesterday = new Duration(),
    hoursThisWeek = new Duration('PT30M'),
    hoursThisMonth = new Duration('PT30M'),
  } = {}) {
    return TimeSummary.create({
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    });
  }

  constructor(
    /** @type {Duration} */ hoursToday,
    /** @type {Duration} */ hoursYesterday,
    /** @type {Duration} */ hoursThisWeek,
    /** @type {Duration} */ hoursThisMonth,
  ) {
    this.hoursToday = hoursToday;
    this.hoursYesterday = hoursYesterday;
    this.hoursThisWeek = hoursThisWeek;
    this.hoursThisMonth = hoursThisMonth;
  }

  // TODO Implement validate()
}
