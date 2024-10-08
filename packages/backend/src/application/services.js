/**
 * @import { LogActivity } from '@activity-sampling/domain'
 * @import { RecentActivitiesQuery } from '@activity-sampling/domain'
 */

import { ActivityLogged, determineRecentActivities } from '../domain/domain.js';
import { Repository } from '../infrastructure/repository.js';

export class Services {
  static create({ activityLogFile } = {}) {
    return new Services(Repository.create({ filename: activityLogFile }));
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
    const activities = await Array.fromAsync(this.repository.replay());
    return determineRecentActivities(activities, query.today);
  }
}
