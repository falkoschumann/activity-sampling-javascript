import { Enum } from './enum.js';

// TODO Differentiate errors by type

export class EnsuringError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnsuringError';
  }
}

export function ensureAnything(value, { name = 'value' } = {}) {
  if (value == null) {
    throw new EnsuringError(`The ${name} is required, but it was ${value}.`);
  }

  return value;
}

export function ensureNonEmpty(value, { name = 'value' } = {}) {
  const valueType = getType(value);
  if (
    (valueType === String && value.length === 0) ||
    (valueType === Array && value.length === 0) ||
    (valueType === Object && Object.keys(value).length === 0)
  ) {
    throw new EnsuringError(
      `The ${name} must not be empty, but it was ${JSON.stringify(value)}.`,
    );
  }

  return value;
}

// TODO Replace ensureOptionalType with ensureType(value, _expectedTypes_)
export function ensureOptionalType(
  value,
  expectedType,
  { name = 'value' } = {},
) {
  if (value == null) {
    return value;
  }

  return ensureType(value, expectedType, { name });
}

/*
 * type: undefined | null | Boolean | Number | BigInt | String | Symbol | Function | Object | Array | Enum | constructor | [ type ] | Record<string, type>
 * expectedType: type | [ type ]
 */

export function ensureType(value, expectedType, { name = 'value' } = {}) {
  const valueType = getType(value);

  // Check built-in types
  if (
    expectedType === undefined ||
    expectedType === null ||
    expectedType === Boolean ||
    expectedType === Number ||
    expectedType === BigInt ||
    expectedType === String ||
    expectedType === Symbol ||
    expectedType === Function ||
    expectedType === Object ||
    expectedType === Array
  ) {
    if (valueType === expectedType) {
      return value;
    }

    throw new EnsuringError(
      `The ${name} must be ${describe(expectedType, { articles: true })}, but it was ${describe(valueType, { articles: true })}.`,
    );
  }

  ensureAnything(value, { name });

  // Check enum types
  if (Object.getPrototypeOf(expectedType) === Enum) {
    try {
      return expectedType.valueOf(String(value).toUpperCase());
    } catch {
      throw new EnsuringError(
        `The ${name} must be ${describe(expectedType, { articles: true })}, but it was ${describe(valueType, { articles: true })}.`,
      );
    }
  }

  // Check constructor types
  if (typeof expectedType === 'function') {
    if (value instanceof expectedType) {
      return value;
    } else {
      const convertedValue = new expectedType(value);
      if (String(convertedValue).toLowerCase().startsWith('invalid')) {
        let message = `The ${name} must be a valid ${describe(expectedType)}, but it was ${describe(valueType, { articles: true })}`;
        if (valueType != null) {
          message += `: ${JSON.stringify(value, { articles: true })}`;
        }
        message += '.';
        throw new EnsuringError(message);
      }

      return convertedValue;
    }
  }

  // Check array item types
  // TODO Replace with options: { itemType: _expectedTypes_ }
  if (Array.isArray(expectedType) && expectedType.length === 1) {
    ensureType(value, Array, { name });
    value.forEach((item, key) => {
      value[key] = ensureType(item, expectedType[0], {
        name: `${name}.${key}`,
      });
    });
  }

  if (typeof expectedType === 'object') {
    // Check struct types
    for (const key in expectedType) {
      value[key] = ensureType(value[key], expectedType[key], {
        name: `${name}.${key}`,
      });
    }

    return value;
  }

  throw new Error('Unreachable code');
}

function getType(value) {
  if (value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    return Array;
  }
  if (Number.isNaN(value)) {
    return NaN;
  }

  switch (typeof value) {
    case 'undefined':
      return undefined;
    case 'boolean':
      return Boolean;
    case 'number':
      return Number;
    case 'bigint':
      return BigInt;
    case 'string':
      return String;
    case 'symbol':
      return Symbol;
    case 'function':
      return Function;
    case 'object':
      return Object;
    default:
      throw new Error('Unknown typeof value: ' + typeof value);
  }
}

function describe(type, { articles = false } = {}) {
  if (Number.isNaN(type)) {
    return 'NaN';
  }

  let name;
  switch (type) {
    case null:
      return 'null';
    case undefined:
      return 'undefined';
    case Array:
      name = 'array';
      break;
    case Boolean:
      name = 'boolean';
      break;
    case Number:
      name = 'number';
      break;
    case BigInt:
      name = 'bigint';
      break;
    case String:
      name = 'string';
      break;
    case Symbol:
      name = 'symbol';
      break;
    case Function:
      name = 'function';
      break;
    case Object:
      name = 'object';
      break;
    default:
      name = type.name;
      break;
  }

  if (articles) {
    name = 'aeiou'.includes(name[0].toLowerCase()) ? `an ${name}` : `a ${name}`;
  }
  return name;
}
