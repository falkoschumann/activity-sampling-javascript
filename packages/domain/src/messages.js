import {
  Duration,
  validateNotEmptyProperty,
  validateOptionalProperty,
  validateRequiredProperty,
} from '@activity-sampling/shared';

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
    const client = validateNotEmptyProperty(
      this,
      'LogActivity',
      'client',
      'string',
    );
    const project = validateNotEmptyProperty(
      this,
      'LogActivity',
      'project',
      'string',
    );
    const task = validateNotEmptyProperty(
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

  static createTestInstance({ today = new Date('2024-06-20T08:00Z') } = {}) {
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
    workingDays = [WorkingDay.createTestInstance()],
    timeSummary = TimeSummary.createTestInstance(),
  } = {}) {
    return new RecentActivities(workingDays, timeSummary);
  }

  constructor(
    /** @type {WorkingDay[]} */ workingDays,
    /** @type {TimeSummary} */ timeSummary,
  ) {
    this.workingDays = workingDays;
    this.timeSummary = timeSummary;
  }

  validate() {
    const workingDays = validateRequiredProperty(
      this,
      'RecentActivities',
      'workingDays',
      'array',
    ).map((workingDay) => WorkingDay.create(workingDay).validate());
    const timeSummary = TimeSummary.create(
      validateRequiredProperty(this, 'RecentActivities', 'timeSummary'),
    ).validate();
    return RecentActivities.create({ workingDays, timeSummary });
  }
}

export class WorkingDay {
  static create({ date, activities } = {}) {
    return new WorkingDay(date, activities);
  }

  static createTestInstance({
    date = new Date('2024-06-20T00:00'),
    activities = [Activity.createTestInstance()],
  } = {}) {
    return WorkingDay.create({ date, activities });
  }

  constructor(/** @type {Date} */ date, /** @type {Activity[]} */ activities) {
    this.date = date;
    this.activities = activities;
  }

  validate() {
    const date = validateRequiredProperty(this, 'WorkingDay', 'date', Date);
    const activities = validateRequiredProperty(
      this,
      'WorkingDay',
      'activities',
      'array',
    ).map((activity) => Activity.create(activity).validate());
    return WorkingDay.create({ date, activities });
  }
}

export class Activity {
  static create({ timestamp, duration, client, project, task, notes }) {
    return new Activity(timestamp, duration, client, project, task, notes);
  }

  static createTestInstance({
    timestamp = new Date('2024-06-20T12:30'),
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

  validate() {
    const timestamp = validateRequiredProperty(
      this,
      'Activity',
      'timestamp',
      Date,
    );
    const duration = validateRequiredProperty(
      this,
      'Activity',
      'duration',
      Duration,
    );
    const client = validateNotEmptyProperty(
      this,
      'Activity',
      'client',
      'string',
    );
    const project = validateNotEmptyProperty(
      this,
      'Activity',
      'project',
      'string',
    );
    const task = validateNotEmptyProperty(this, 'Activity', 'task', 'string');
    const notes = validateOptionalProperty(this, 'Activity', 'notes', 'string');
    return Activity.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }
}

export class TimeSummary {
  static create({
    hoursToday,
    hoursYesterday,
    hoursThisWeek,
    hoursThisMonth,
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

  validate() {
    const hoursToday = validateRequiredProperty(
      this,
      'TimeSummary',
      'hoursToday',
      Duration,
    );
    const hoursYesterday = validateRequiredProperty(
      this,
      'TimeSummary',
      'hoursYesterday',
      Duration,
    );
    const hoursThisWeek = validateRequiredProperty(
      this,
      'TimeSummary',
      'hoursThisWeek',
      Duration,
    );
    const hoursThisMonth = validateRequiredProperty(
      this,
      'TimeSummary',
      'hoursThisMonth',
      Duration,
    );
    return TimeSummary.create({
      hoursToday,
      hoursYesterday,
      hoursThisWeek,
      hoursThisMonth,
    });
  }
}
