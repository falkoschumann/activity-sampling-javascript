import { Duration } from 'activity-sampling-shared';

export class Api {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
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
      headers: { 'Content-Type': 'application/json' },
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
        duration: new Duration(rawActivity.duration),
        client: rawActivity.client,
        project: rawActivity.project,
        task: rawActivity.task,
        notes: rawActivity.notes,
      })),
    })),
    timeSummary: {
      hoursToday: new Duration(raw.timeSummary.hoursToday),
      hoursYesterday: new Duration(raw.timeSummary.hoursYesterday),
      hoursThisWeek: new Duration(raw.timeSummary.hoursThisWeek),
      hoursThisMonth: new Duration(raw.timeSummary.hoursThisMonth),
    },
  };
}
