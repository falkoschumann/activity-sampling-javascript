export class Duration {
  static ZERO = new Duration(0);

  /**
   * @param {number|string|Duration} [value=0] - The duration in seconds or an ISO 8601 string.
   */
  constructor(value) {
    if (value == null) {
      this.seconds = 0;
    } else if (typeof value === 'string') {
      this.seconds = Duration.parse(value).seconds;
    } else if (typeof value === 'number') {
      this.seconds = value;
    } else if (value instanceof Duration) {
      this.seconds = value.seconds;
    } else {
      throw new TypeError(
        'The parameter `value` must be a number, an ISO 8601 string or an other `Duration` object.',
      );
    }
  }

  static parse(isoString) {
    const match = isoString.match(
      /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?$/,
    );
    if (match == null) {
      throw new TypeError('Invalid Duration');
    }

    const hours = Number(match[1] || 0);
    const minutes = Number(match[2] || 0);
    const seconds = Number(match[3] || 0);
    const millis = Number(match[4] || 0);
    return new Duration(hours * 3600 + minutes * 60 + seconds + millis / 1000);
  }

  get hours() {
    return this.seconds / 3600;
  }

  get hoursPart() {
    return Math.floor(this.seconds / 3600);
  }

  get minutes() {
    return this.seconds / 60;
  }

  get minutesPart() {
    return Math.floor((this.seconds - this.hoursPart * 3600) / 60);
  }

  get secondsPart() {
    return this.seconds - this.hoursPart * 3600 - this.minutesPart * 60;
  }

  get millis() {
    return this.seconds * 1000;
  }

  get millisPart() {
    return Math.round(this.seconds * 1000) % 1000;
  }

  add(other) {
    this.seconds += other;
    return this;
  }

  toISOString() {
    let result = 'PT';
    let hours = this.hoursPart;
    if (hours > 0) {
      result += `${hours}H`;
    }
    let minutes = this.minutesPart;
    if (minutes > 0) {
      result += `${minutes}M`;
    }
    let seconds = this.secondsPart;
    if (seconds > 0) {
      result += `${seconds}S`;
    }
    if (result === 'PT') {
      result += '0S';
    }
    return result;
  }

  toJSON() {
    return this.toISOString();
  }

  toLocaleString() {
    return this.toString();
  }

  toString({ style = 'medium' } = {}) {
    let hours = String(this.hoursPart).padStart(2, '0');
    let minutes = String(this.minutesPart).padStart(2, '0');
    let seconds = String(this.secondsPart).padStart(2, '0');
    let string = `${hours}:${minutes}`;
    return style === 'short' ? string : `${string}:${seconds}`;
  }

  valueOf() {
    return this.seconds;
  }
}
