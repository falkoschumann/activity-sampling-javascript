export class Duration {
  static zero() {
    return new Duration();
  }

  /* TODO Parse a ISO 8601 string like `[-]P[dD]T[hH][mM][s[.f]S]`. */
  /** Parse a ISO 8601 string like `[-]PT[hH][mM][s[.f]S]`. */
  static parse(isoString) {
    const match = isoString.match(
      /^(-)?PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+\.?\d*)S)?$/,
    );
    if (match == null) {
      return new Duration(NaN);
    }

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);
    const seconds = Number(match[4] || 0);
    const millis = Number(match[5] || 0);
    return new Duration(
      sign * (hours * 3600000 + minutes * 60000 + seconds * 1000 + millis),
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
      if (Number.isFinite(value)) {
        this.millis = value < 0 ? Math.ceil(value) : Math.floor(value);
      } else {
        this.millis = NaN;
      }
    } else if (value instanceof Duration) {
      this.millis = value.millis;
    } else {
      this.millis = NaN;
    }
  }

  get isZero() {
    return this.millis === 0;
  }

  get isNegative() {
    return this.millis < 0;
  }

  get isPositive() {
    return this.millis > 0;
  }

  get hours() {
    return this.millis / 3600000;
  }

  get hoursPart() {
    const value = this.millis / 3600000;
    return this.isNegative ? Math.ceil(value) : Math.floor(value);
  }

  get minutes() {
    return this.millis / 60000;
  }

  get minutesPart() {
    const value = (this.millis - this.hoursPart * 3600000) / 60000;
    return this.isNegative ? Math.ceil(value) : Math.floor(value);
  }

  get seconds() {
    return this.millis / 1000;
  }

  get secondsPart() {
    const value =
      (this.millis - this.hoursPart * 3600000 - this.minutesPart * 60000) /
      1000;
    return this.isNegative ? Math.ceil(value) : Math.floor(value);
  }

  get millisPart() {
    const value =
      this.millis -
      this.hoursPart * 3600000 -
      this.minutesPart * 60000 -
      this.secondsPart * 1000;
    return this.isNegative ? Math.ceil(value) : Math.floor(value);
  }

  absolutized() {
    return new Duration(Math.abs(this.millis));
  }

  negated() {
    return new Duration(-this.millis);
  }

  plus(other) {
    this.millis += other;
    return this;
  }

  minus(other) {
    this.millis -= other;
    return this;
  }

  toISOString() {
    const value = this.absolutized();
    let result = 'PT';
    const hours = value.hoursPart;
    if (hours > 0) {
      result += `${hours}H`;
    }
    const minutes = value.minutesPart;
    if (minutes > 0) {
      result += `${minutes}M`;
    }
    const seconds = value.secondsPart;
    const millis = value.millisPart;
    if (seconds > 0 || millis > 0) {
      result += `${seconds + millis / 1000}S`;
    }
    if (result === 'PT') {
      result += '0S';
    }
    if (this.isNegative) {
      result = `-${result}`;
    }
    return result;
  }

  toJSON() {
    return this.toISOString();
  }

  toString({ style = 'medium' } = {}) {
    if (Number.isNaN(this.valueOf())) {
      return 'Invalid Duration';
    }

    const value = this.absolutized();
    const hours = String(value.hoursPart).padStart(2, '0');
    const minutes = String(value.minutesPart).padStart(2, '0');
    const seconds = String(value.secondsPart).padStart(2, '0');
    let result = `${hours}:${minutes}`;
    if (style === 'medium' || style === 'long') {
      result += `:${seconds}`;
    }
    if (style === 'long') {
      result += `.${String(value.millisPart).padStart(3, '0')}`;
    }
    if (this.isNegative) {
      result = `-${result}`;
    }
    return result;
  }

  valueOf() {
    return this.millis;
  }
}
