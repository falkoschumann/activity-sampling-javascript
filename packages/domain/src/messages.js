import { Duration, ensureNonEmpty, ensureType } from '@muspellheim/utils';

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
      { name: 'LogActivity' },
    );
    ensureNonEmpty(this.client, { name: 'LogActivity.client' });
    ensureNonEmpty(this.project, { name: 'LogActivity.project' });
    ensureNonEmpty(this.task, { name: 'LogActivity.task' });
    ensureNonEmpty(this.notes, { name: 'LogActivity.notes' });
    return LogActivity.create(dto);
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
    const dto = ensureType(
      this,
      {
        today: Date,
      },
      { name: 'RecentActivitiesQuery' },
    );
    return RecentActivitiesQuery.create(dto);
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
    const dto = ensureType(
      this,
      { workingDays: Array, timeSummary: Object },
      { name: 'RecentActivities' },
    );
    dto.workingDays = dto.workingDays.map((workingDay, index) =>
      WorkingDay.create(workingDay).validate({
        name: `RecentActivities.workingDays.${index}`,
      }),
    );
    dto.timeSummary = TimeSummary.create(dto.timeSummary).validate({
      name: 'RecentActivities.timeSummary',
    });
    return RecentActivities.create(dto);
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

  validate({ name = 'WorkingDay' } = {}) {
    const dto = ensureType(this, { date: Date, activities: Array }, { name });
    dto.activities = dto.activities.map((activity, index) =>
      Activity.create(activity).validate({
        name: `${name}.activities.${index}`,
      }),
    );
    return WorkingDay.create(dto);
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
    notes = '',
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

  validate({ name = 'Activity' } = {}) {
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
      { name },
    );
    ensureNonEmpty(this.client, { name: `${name}.client` });
    ensureNonEmpty(this.project, { name: `${name}.project` });
    ensureNonEmpty(this.task, { name: `${name}.task` });
    if (dto.notes == null) {
      dto.notes = '';
    }
    return Activity.create(dto);
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

  validate({ name = 'TimeSummary' } = {}) {
    const dto = ensureType(
      this,
      {
        hoursToday: Duration,
        hoursYesterday: Duration,
        hoursThisWeek: Duration,
        hoursThisMonth: Duration,
      },
      { name },
    );
    return TimeSummary.create(dto);
  }
}
