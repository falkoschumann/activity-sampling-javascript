export class AbstractApi {
  async getRecentActivities() {
    return { workingDays: [] };
  }
}

export class Api extends AbstractApi {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
    super();
    this.#baseUrl = baseUrl;
  }

  async getRecentActivities() {
    let response = await fetch(`${this.#baseUrl}/get-recent-activities`);
    let dto = await response.json();
    return mapRecentActivitiesDto(dto);
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
  };
}
