import {
  ConfigurableResponses,
  Duration,
  OutputTracker,
} from 'activity-sampling-shared';

export class ActivitiesGateway extends EventTarget {
  static create({ baseUrl = '/api' } = {}) {
    return new ActivitiesGateway(baseUrl, globalThis.fetch.bind(globalThis));
  }

  static createNull({
    responses = { status: 200, headers: {}, body: null },
  } = {}) {
    return new ActivitiesGateway(
      '/null-activities-gateway',
      createFetchStub(responses),
    );
  }

  #baseUrl;
  /** @type {typeof globalThis.fetch} */ #fetch;

  constructor(baseUrl, fetch) {
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async loadRecentActivities() {
    let response = await this.#fetch(`${this.#baseUrl}/recent-activities`);
    let dto = await response.json();
    return mapRecentActivities(dto);
  }

  async logActivity({ timestamp, duration, client, project, task, notes }) {
    const activity = { timestamp, duration, client, project, task, notes };
    let body = JSON.stringify(activity);
    await this.#fetch(`${this.#baseUrl}/log-activity`, {
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
  #status;
  #headers;
  #body;

  constructor({ status, headers, body } = {}) {
    this.#status = status;
    this.#headers = new Headers(headers);
    this.#body = body != null ? JSON.stringify(body) : body;
  }

  get ok() {
    return this.#status >= 200 && this.#status < 300;
  }

  get status() {
    return this.#status;
  }

  get headers() {
    return this.#headers;
  }

  json() {
    return JSON.parse(this.#body);
  }
}
