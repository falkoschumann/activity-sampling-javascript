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
    let match = isoString.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
    if (match == null) {
      throw new TypeError('Invalid Duration');
    }

    let hours = Number(match[1] || 0);
    let minutes = Number(match[2] || 0);
    let seconds = Number(match[3] || 0);
    seconds += hours * 3600 + minutes * 60;
    return new Duration(seconds);
  }

  plus(duration) {
    this.seconds += duration;
    return this;
  }

  toISOString() {
    let result = 'PT';
    let hours = Math.floor(this.seconds / 3600);
    if (hours > 0) {
      result += `${hours}H`;
    }
    let minutes = Math.floor((this.seconds - hours * 3600) / 60);
    if (minutes > 0) {
      result += `${minutes}M`;
    }
    let seconds = this.seconds - hours * 3600 - minutes * 60;
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
}
