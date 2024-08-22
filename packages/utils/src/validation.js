import { Enum } from './enum.js';

// TODO Differentiate validation errors
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequiredParameter(value, parameterName, valueType) {
  requireAnything(value, `The parameter "${parameterName}" is required.`);

  if (valueType == null) {
    return value;
  }

  requireType(
    value,
    valueType,
    `The parameter "${parameterName}" must be a ${valueType}, found {{type}}: {{value}}.`,
  );
  return value;
}

export function validateNotEmptyProperty(
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
  return requireNonEmpty(
    value,
    `The property "${propertyName}" of ${objectName} must not be an empty ${propertyType}.`,
  );
}

// TODO Replace string propertyType and itemType with constructor functions
export function validateRequiredProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  requireAnything(object, `The ${objectName} is required.`);
  requireAnything(
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
  requireAnything(object, `The ${objectName} is required.`);
  if (propertyType == null) {
    return object[propertyName];
  }

  const value = object[propertyName];
  if (value == null) {
    return value;
  }

  if (propertyType === 'array') {
    requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be an ${propertyType}, found {{type}}: {{value}}.`,
    );
    if (itemType != null) {
      requireItemType(
        value,
        itemType,
        `The property "${propertyName}" of ${objectName} must be an ${propertyType} of ${itemType}s, found {{type}} at #{{key}}: {{value}}.`,
      );
    }

    return value;
  } else if (propertyType === 'object') {
    return requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be an ${propertyType}, found {{type}}: {{value}}.`,
    );
  } else if (typeof propertyType === 'function') {
    return requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be a valid ${propertyType.name}, found {{type}}: {{value}}.`,
    );
  } else {
    return requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be a ${propertyType}, found {{type}}: {{value}}.`,
    );
  }
}

function requireAnything(value, message) {
  const valueType = getType(value);
  if (valueType === null || valueType === undefined) {
    throw new ValidationError(message);
  }

  return value;
}

function requireNonEmpty(value, message) {
  const valueType = getType(value);
  if (
    (valueType === String && value === '') ||
    (valueType === Array && value.length === 0)
  ) {
    throw new ValidationError(message);
  }

  return value;
}

function requireType(value, expectedType, message) {
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

function requireItemType(collection, expectedType, message) {
  collection.forEach((item, key) => {
    if (Array.isArray(collection)) {
      key++;
    }
    requireType(item, expectedType, message?.replace('{{key}}', key));
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
