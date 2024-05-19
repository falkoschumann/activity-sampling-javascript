import {
  ConfigurableResponses,
  Duration,
  OutputTracker,
} from '@activity-sampling/shared';

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

  async logActivity({ timestamp, duration, client, project, task, notes }) {
    const activity = { timestamp, duration, client, project, task, notes };
    let body = JSON.stringify(activity);
    await this.#fetch('/api/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent('activity-logged', { detail: activity }),
    );
  }

  trackActivitiesLogged() {
    return new OutputTracker(this, 'activity-logged');
  }

  async loadRecentActivities() {
    let response = await this.#fetch('/api/recent-activities');
    let dto = await response.json();
    return mapRecentActivities(dto);
  }
}

function mapRecentActivities(dto) {
  return {
    workingDays: dto.workingDays.map((dtoDay) => ({
      date: new Date(dtoDay.date),
      activities: dtoDay.activities.map((dtoActivity) => ({
        timestamp: new Date(dtoActivity.timestamp),
        duration: new Duration(dtoActivity.duration),
        client: dtoActivity.client,
        project: dtoActivity.project,
        task: dtoActivity.task,
        notes: dtoActivity.notes,
      })),
    })),
    timeSummary: {
      hoursToday: new Duration(dto.timeSummary.hoursToday),
      hoursYesterday: new Duration(dto.timeSummary.hoursYesterday),
      hoursThisWeek: new Duration(dto.timeSummary.hoursThisWeek),
      hoursThisMonth: new Duration(dto.timeSummary.hoursThisMonth),
    },
  };
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
