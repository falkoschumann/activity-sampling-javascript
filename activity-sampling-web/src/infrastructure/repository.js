export class FakeRepository {
  #activityLog;

  constructor(activityLog) {
    this.#activityLog = activityLog;
  }

  async findAll() {
    return this.#activityLog;
  }
}
