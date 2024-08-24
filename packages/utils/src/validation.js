import { Enum } from './enum.js';

// TODO Rename module to ensure.js
// TODO Replace ValidationError with Error
// TODO Build error messages

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequiredParameter(value, parameterName, valueType) {
  ensureAnything(value, `The parameter "${parameterName}" is required.`);

  if (valueType == null) {
    return value;
  }

  validateType(
    value,
    valueType,
    `The parameter "${parameterName}" must be a ${valueType}, found {{type}}: {{value}}.`,
  );
  return value;
}

export function validateNonEmptyProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  const value = validateRequiredProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );
  return ensureNonEmpty(
    value,
    `The property "${propertyName}" of ${objectName} must not be an empty ${propertyType}.`,
  );
}

export function validateRequiredProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  ensureAnything(object, `The ${objectName} is required.`);
  ensureAnything(
    object[propertyName],
    `The property "${propertyName}" is required for ${objectName}.`,
  );
  const value = validateOptionalProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );

  return value;
}

export function validateOptionalProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  ensureAnything(object, `The ${objectName} is required.`);
  if (propertyType == null) {
    return object[propertyName];
  }

  const value = object[propertyName];
  if (value == null) {
    return value;
  }

  if (propertyType === 'array') {
    validateType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be an ${propertyType}, found {{type}}: {{value}}.`,
    );
    if (itemType != null) {
      validateItemType(
        value,
        itemType,
        `The property "${propertyName}" of ${objectName} must be an ${propertyType} of ${itemType}s, found {{type}} at #{{key}}: {{value}}.`,
      );
    }

    return value;
  } else if (propertyType === 'object') {
    return validateType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be an ${propertyType}, found {{type}}: {{value}}.`,
    );
  } else if (typeof propertyType === 'function') {
    return validateType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be a valid ${propertyType.name}, found {{type}}: {{value}}.`,
    );
  } else {
    return validateType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be a ${propertyType}, found {{type}}: {{value}}.`,
    );
  }
}

export function ensureAnything(value, message) {
  if (value == null) {
    throw new ValidationError(message);
  }

  return value;
}

export function ensureNonEmpty(value, message) {
  const valueType = getType(value);
  if (
    (valueType === String && value.length === 0) ||
    (valueType === Array && value.length === 0) ||
    (valueType === Object && Object.keys(value).length === 0)
  ) {
    throw new ValidationError(message);
  }

  return value;
}

export function ensureOptionalType(value, expectedType, message) {
  if (value == null) {
    return value;
  }

  return ensureType(value, expectedType, message);
}

export function ensureType(value, expectedType, message) {
  const valueType = getType(value);

  // Check array
  if (expectedType === Array) {
    if (valueType !== Array) {
      throw new ValidationError(message);
    }

    return value;
  }

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
    expectedType === Object
  ) {
    if (valueType === expectedType) {
      return value;
    }

    throw new ValidationError(message);
  }

  // Check enum types
  if (Object.getPrototypeOf(expectedType) === Enum) {
    try {
      return expectedType.valueOf(String(value).toUpperCase());
    } catch {
      throw new ValidationError(message);
    }
  }

  // Check constructor types
  if (typeof expectedType === 'function') {
    if (value instanceof expectedType) {
      return value;
    } else {
      const convertedValue = new expectedType(value);
      if (String(convertedValue).toLowerCase().startsWith('invalid')) {
        throw new ValidationError(message);
      }

      return convertedValue;
    }
  }

  // Check array item types
  if (Array.isArray(expectedType) && expectedType.length === 1) {
    ensureType(value, Array, message);
    value.forEach((item) => {
      ensureType(item, expectedType[0], message);
    });
  }

  if (typeof expectedType === 'object') {
    // Check struct types
    for (const key in expectedType) {
      ensureType(value[key], expectedType[key], message);
    }

    return value;
  }

  throw new Error('Unreachable code');
}

function validateType(value, expectedType, message) {
  const valueType = getType(value);
  if (expectedType === 'array') {
    if (valueType !== Array) {
      throw new ValidationError(getMessage());
    }
  } else if (expectedType === 'object') {
    if (valueType !== Object) {
      throw new ValidationError(getMessage());
    }
  } else if (typeof expectedType === 'function') {
    if (value instanceof expectedType) {
      return value;
    }

    if (Object.getPrototypeOf(expectedType) === Enum) {
      try {
        return expectedType.valueOf(String(value).toUpperCase());
      } catch (error) {
        if (error.message?.startsWith('No enum constant')) {
          throw new ValidationError(getMessage());
        }

        throw error;
      }
    }

    const convertedValue = new expectedType(value);
    if (String(convertedValue).toLowerCase().startsWith('invalid')) {
      throw new ValidationError(getMessage());
    }
    return convertedValue;
  } else if (typeof value !== expectedType) {
    throw new ValidationError(getMessage());
  }

  return value;

  function getMessage() {
    return message
      ?.replace('{{type}}', getName(valueType))
      ?.replace('{{value}}', JSON.stringify(value));
  }
}

function validateItemType(collection, expectedType, message) {
  collection.forEach((item, key) => {
    if (Array.isArray(collection)) {
      key++;
    }
    validateType(item, expectedType, message?.replace('{{key}}', key));
  });
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

function getName(type) {
  if (Number.isNaN(type)) {
    return 'NaN';
  }

  switch (type) {
    case null:
      return 'null';
    case undefined:
      return 'undefined';
    case Array:
      return 'array';
    case Boolean:
      return 'boolean';
    case Number:
      return 'number';
    case BigInt:
      return 'bigint';
    case String:
      return 'string';
    case Symbol:
      return 'symbol';
    case Function:
      return 'function';
    case Object:
      return 'object';
    default:
      throw new Error('Unknown type: ' + type);
  }
}
