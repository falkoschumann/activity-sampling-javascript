import { RecentActivities, ActivityLogged } from '../domain/activities.js';
import { Repository } from '../infrastructure/repository.js';

export class Services {
  static create() {
    return new Services(Repository.create());
  }

  static createNull() {
    return new Services(Repository.createNull());
  }

  constructor(/** @type {Repository} */ repository) {
    this.repository = repository;
  }

  async logActivity({ timestamp, duration, client, project, task, notes }) {
    const activityLogged = ActivityLogged.create({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
    await this.repository.record(activityLogged);
  }

  async selectRecentActivities({ today }) {
    let activities = await this.repository.replay();
    return RecentActivities.create({ activities, today });
  }
}
