export class Duration {
  static zero() {
    return new Duration(0);
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
    return new Duration(
      hours * 3600000 + minutes * 60000 + seconds * 1000 + millis,
    );
  }

  /**
   * @param {number|string|Duration} [value=0] - The duration in millis or an ISO 8601 string.
   */
  constructor(value) {
    if (value == null) {
      this.millis = 0;
    } else if (typeof value === 'string') {
      this.millis = Duration.parse(value).millis;
    } else if (typeof value === 'number') {
      this.millis = value;
    } else if (value instanceof Duration) {
      this.millis = value.millis;
    } else {
      throw new TypeError(
        'The parameter `value` must be a number, an ISO 8601 string or an other `Duration` object.',
      );
    }
  }

  get hours() {
    return this.millis / 3600000;
  }

  get hoursPart() {
    return Math.floor(this.millis / 3600000);
  }

  get minutes() {
    return this.millis / 60000;
  }

  get minutesPart() {
    return Math.floor((this.millis - this.hoursPart * 3600000) / 60000);
  }

  get seconds() {
    return this.millis / 1000;
  }

  get secondsPart() {
    return Math.floor(
      (this.millis - this.hoursPart * 3600000 - this.minutesPart * 60000) /
        1000,
    );
  }

  get millisPart() {
    return (
      this.millis -
      this.hoursPart * 3600000 -
      this.minutesPart * 60000 -
      this.secondsPart * 1000
    );
  }

  add(other) {
    this.millis += other;
    return this;
  }

  subtract(other) {
    this.millis -= other;
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
    return this.millis;
  }
}
