import express from 'express';

import { LogActivity, RecentActivitiesQuery } from '@activity-sampling/domain';
import { reply, runSafe } from '@activity-sampling/utils/src/express.js';

/**
 * @import { Services } from '../application/services.js'
 */

export class ActivitiesController {
  #services;

  constructor(
    /** @type {Services} */ services,
    /** @type {express.Express} */ app,
  ) {
    this.#services = services;
    app.use('/api/', express.static('../../spec/api'));
    app.post('/api/log-activity', runSafe(this.#postLogActivity.bind(this)));
    app.get(
      '/api/recent-activities',
      runSafe(this.#getRecentActivities.bind(this)),
    );
  }

  async #postLogActivity(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const logActivity = LogActivity.create(request.body).validate();
    await this.#services.logActivity(logActivity);
    reply(response, { status: 204 });
  }

  async #getRecentActivities(
    /** @type {express.Request} */ request,
    /** @type {express.Response} */ response,
  ) {
    const { today } = RecentActivitiesQuery.create(request.query).validate();
    const body = await this.#services.selectRecentActivities({ today });
    reply(response, { headers: { 'Content-Type': 'application/json' }, body });
  }
}
