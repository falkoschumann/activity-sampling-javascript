export class Enum {
  static values() {
    return Object.values(this);
  }

  static valueOf(name) {
    const value = this.values().find((v) => v.name === name);
    if (value == null) {
      throw new Error(`No enum constant ${this.name}.${name} exists.`);
    }
    return value;
  }

  constructor(ordinal, name) {
    // TODO Validate ordinal and name are present
    this.ordinal = ordinal;
    this.name = name;
  }

  toString() {
    return this.name;
  }

  valueOf() {
    return this.ordinal;
  }

  toJSON() {
    return this.name;
  }
}
