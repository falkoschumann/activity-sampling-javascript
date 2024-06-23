import { ActivityLogged, determineRecentActivities } from '../domain/domain.js';
import { Repository } from '../infrastructure/repository.js';

/**
 * @typedef {import('../domain/messages.js').LogActivity} LogActivity
 * @typedef {import('../domain/messages.js').RecentActivitiesQuery} RecentActivitiesQuery
 */

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

  async logActivity(/** @type {LogActivity} */ command) {
    const activityLogged = ActivityLogged.create(command);
    await this.repository.record(activityLogged);
  }

  async selectRecentActivities(/** @type {RecentActivitiesQuery} */ query) {
    const activities = await this.repository.replay();
    return determineRecentActivities(activities, query.today);
  }
}
