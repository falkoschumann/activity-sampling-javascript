export class AbstractApi {
  async getRecentActivities() {
    return { workingDays: [] };
  }

  // eslint-disable-next-line no-unused-vars
  async postLogActivity(activity) {}
}

export class Api extends AbstractApi {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
    super();
    this.#baseUrl = baseUrl;
  }

  async getRecentActivities() {
    let response = await fetch(`${this.#baseUrl}/recent-activities`);
    let dto = await response.json();
    return mapRecentActivitiesDto(dto);
  }

  async postLogActivity(activity) {
    let dto = JSON.stringify(activity);
    await fetch(`${this.#baseUrl}/log-activity`, {
      method: 'POST',
      body: dto,
    });
  }
}

function mapRecentActivitiesDto(raw) {
  return {
    workingDays: raw.workingDays.map((rawDay) => ({
      date: new Date(rawDay.date),
      activities: rawDay.activities.map((rawActivity) => ({
        timestamp: new Date(rawActivity.timestamp),
        duration: rawActivity.duration,
        client: rawActivity.client,
        project: rawActivity.project,
        task: rawActivity.task,
        notes: rawActivity.notes,
      })),
    })),
    timeSummary: {
      hoursToday: raw.timeSummary.hoursToday,
      hoursYesterday: raw.timeSummary.hoursYesterday,
      hoursThisWeek: raw.timeSummary.hoursThisWeek,
      hoursThisMonth: raw.timeSummary.hoursThisMonth,
    },
  };
}
