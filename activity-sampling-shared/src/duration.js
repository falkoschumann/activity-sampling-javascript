// TODO parse ISO 8601 in constructor
// TODO toISOString()

export class Duration {
  seconds;

  constructor(seconds = 0) {
    this.seconds = seconds;
  }

  plus(duration) {
    this.seconds += duration;
    return this;
  }

  toLocaleString() {
    return this.toString();
  }

  toString({ style = 'medium' } = {}) {
    let hours = Math.floor(this.seconds / 3600);
    let minutes = Math.floor((this.seconds - hours * 3600) / 60);
    let seconds = this.seconds - hours * 3600 - minutes * 60;
    let string = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    if (style === 'short') {
      return string;
    }
    return string + `:${seconds.toString().padStart(2, '0')}`;
  }

  valueOf() {
    return this.seconds;
  }

  toJSON() {
    return this.seconds;
  }
}
