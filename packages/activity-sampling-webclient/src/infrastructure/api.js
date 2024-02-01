import {
  ConfigurableResponses,
  Duration,
  OutputTracker,
} from 'activity-sampling-shared';

// TODO create DTO classes

export class Api extends EventTarget {
  static create({ baseUrl = '/api' } = {}) {
    return new Api(baseUrl, globalThis.fetch.bind(globalThis));
  }

  static createNull({
    responses = { status: 200, headers: {}, body: null },
  } = {}) {
    return new Api('/null-api', createFetchStub(responses));
  }

  #baseUrl;
  #fetch;

  constructor(baseUrl, fetch) {
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async getRecentActivities() {
    let response = await this.#fetch(`${this.#baseUrl}/recent-activities`);
    let dto = await response.json();
    return mapRecentActivitiesDto(dto);
  }

  async getHoursWorked() {
    let response = await this.#fetch(`${this.#baseUrl}/hours-worked`);
    let dto = await response.json();
    return mapHoursWorked(dto);
  }

  async logActivity(activity) {
    let dto = JSON.stringify(activity);
    await this.#fetch(`${this.#baseUrl}/log-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dto,
    });
    this.dispatchEvent(
      new CustomEvent('activity-logged', { detail: activity }),
    );
  }

  trackActivitiesLogged() {
    return new OutputTracker(this, 'activity-logged');
  }
}

function mapRecentActivitiesDto(dto) {
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

function mapHoursWorked(dto) {
  return {
    clients: dto.clients.map((dtoClient) => ({
      name: dtoClient.name,
      hours: new Duration(dtoClient.hours),
    })),
  };
}

function createFetchStub(activities) {
  const responses = ConfigurableResponses.create(activities);
  return async function () {
    const response = responses.next();
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
