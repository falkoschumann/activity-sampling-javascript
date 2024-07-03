import { ConfigurableResponses, OutputTracker } from '@activity-sampling/utils';
import { RecentActivities } from '@activity-sampling/domain';

/**
 * @typedef {import('@activity-sampling/domain').LogActivity} LogActivity
 */

export const ACTIVITY_LOGGED_EVENT = 'activity-logged';

export class Api extends EventTarget {
  static create() {
    return new Api(globalThis.fetch.bind(globalThis));
  }

  static createNull({ response = { body: null } } = {}) {
    return new Api(createFetchStub(response));
  }

  /** @type {typeof globalThis.fetch} */ #fetch;

  constructor(fetch) {
    super();
    this.#fetch = fetch;
  }

  async logActivity(/** @type {LogActivity} */ activity) {
    const body = JSON.stringify(activity);
    await this.#fetch('/api/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(ACTIVITY_LOGGED_EVENT, { detail: activity }),
    );
  }

  trackActivitiesLogged() {
    return new OutputTracker(this, ACTIVITY_LOGGED_EVENT);
  }

  async selectRecentActivities() {
    const response = await this.#fetch('/api/recent-activities');
    const json = await response.json();
    const dto = RecentActivities.create(json);
    return dto.validate();
  }
}

function createFetchStub(responses) {
  const configurableResponses = ConfigurableResponses.create(responses);
  return async function () {
    const response = configurableResponses.next();
    return new ResponseStub(response);
  };
}

class ResponseStub {
  #body;

  constructor({ body }) {
    this.#body = body != null ? JSON.stringify(body) : body;
  }

  json() {
    return JSON.parse(this.#body);
  }
}
