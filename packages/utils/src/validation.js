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

  const foundType = typeof value;
  if (foundType !== valueType) {
    throw new ValidationError(
      `The parameter "${parameterName}" must be a ${valueType}, found ${foundType}: ${JSON.stringify(value)}.`,
    );
  }

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
  const value = validateTypedProperty(
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
  return validateTypedProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );
}

function validateTypedProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  if (propertyType == null) {
    return object[propertyName];
  }

  const value = object[propertyName];
  if (value == null) {
    return value;
  }
  const valueType = Array.isArray(value) ? 'array' : typeof value;

  if (propertyType === 'array') {
    return validateArrayProperty(object, objectName, propertyName, itemType);
  } else if (propertyType === 'object') {
    return requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be an object, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  } else if (typeof propertyType === 'function') {
    return validateObjectTypeProperty(
      object,
      objectName,
      propertyName,
      propertyType,
    );
  } else {
    return requireType(
      value,
      propertyType,
      `The property "${propertyName}" of ${objectName} must be a ${propertyType}, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  }
}

function validateArrayProperty(object, objectName, propertyName, itemType) {
  // TODO Join with requireType
  const value = object[propertyName];
  if (value == null) {
    return value;
  }

  const valueType = typeof value;
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must be an array, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  }

  if (itemType != null) {
    value.forEach((item, index) => {
      // TODO use validateTypedProperty
      if (typeof item !== itemType) {
        throw new ValidationError(
          `The property "${propertyName}" of ${objectName} must be an array of ${itemType}s, found ${typeof item} at #${index + 1}: ${JSON.stringify(item)}.`,
        );
      }
    });
  }

  return value;
}

function validateObjectTypeProperty(
  object,
  objectName,
  propertyName,
  propertyType,
) {
  const value = object[propertyName];
  if (value == null) {
    return value;
  }

  const valueType = typeof value;
  if (valueType === 'object' && value instanceof propertyType) {
    return value;
  }

  if (Object.getPrototypeOf(propertyType) === Enum) {
    try {
      return propertyType.valueOf(String(value).toUpperCase());
    } catch (error) {
      if (error.message?.startsWith('No enum constant')) {
        throw new ValidationError(
          `The property "${propertyName}" of ${objectName} must be a valid ${propertyType.name} constant name, found ${valueType}: ${JSON.stringify(value)}.`,
        );
      }

      throw error;
    }
  }

  const convertedValue = new propertyType(value);
  if (String(convertedValue).toLowerCase().startsWith('invalid')) {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must be a valid ${propertyType.name}, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  }

  return convertedValue;
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
  if (
    (expectedType === 'array' && valueType !== Array) ||
    (expectedType === 'object' && valueType !== Object) ||
    typeof value !== expectedType
  ) {
    throw new ValidationError(message);
  }

  return value;
}

function getType(value) {
  if (value === null) return null;
  if (Array.isArray(value)) return Array;
  if (Number.isNaN(value)) return NaN;

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
      throw new Error('Unknown typeof value: ' + typeof variable);
  }
}
