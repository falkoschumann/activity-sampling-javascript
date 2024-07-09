import { Enum } from './enum.js';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
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

  if (propertyType === 'string' || propertyType === 'array') {
    validateNotEmpty(object, objectName, propertyName);
  }

  return value;
}

export function validateRequiredProperty(
  object,
  objectName,
  propertyName,
  propertyType,
  itemType,
) {
  if (!isPresent(object)) {
    throw new ValidationError(`The ${objectName} is required.`);
  }

  if (!isPresent(object[propertyName])) {
    throw new ValidationError(
      `The property "${propertyName}" is required for ${objectName}.`,
    );
  }

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
  if (!isPresent(object)) {
    throw new ValidationError(`The ${objectName} is required.`);
  }

  const value = object[propertyName];
  if (!isPresent(value)) {
    return value;
  }

  return validateTypedProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );
}

function validateNotEmpty(object, objectName, propertyName) {
  const value = object[propertyName];
  if (typeof value === 'string' && value === '') {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must not be an empty string.`,
    );
  }

  if (Array.isArray(value) && value.length === 0) {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must not be an empty array.`,
    );
  }
}

function isPresent(value) {
  return value !== null && value !== undefined;
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

  if (propertyType === 'array') {
    return validateArrayProperty(object, objectName, propertyName, itemType);
  }

  if (propertyType === 'object') {
    return validateObjectProperty(object, objectName, propertyName, itemType);
  }

  if (typeof propertyType === 'function') {
    return validateObjectTypeProperty(
      object,
      objectName,
      propertyName,
      propertyType,
    );
  }

  return validatePrimitiveTypeProperty(
    object,
    objectName,
    propertyName,
    propertyType,
  );
}

function validateArrayProperty(object, objectName, propertyName, itemType) {
  const value = object[propertyName];
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

function validateObjectProperty(object, objectName, propertyName) {
  const value = object[propertyName];
  const valueType = typeof value;
  if (valueType !== 'object') {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must be an object, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  }

  if (Array.isArray(value)) {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must be an object, found array: ${JSON.stringify(value)}.`,
    );
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

function validatePrimitiveTypeProperty(
  object,
  objectName,
  propertyName,
  propertyType,
) {
  const value = object[propertyName];
  const valueType = typeof value;
  if (valueType !== propertyType) {
    throw new ValidationError(
      `The property "${propertyName}" of ${objectName} must be a ${propertyType}, found ${valueType}: ${JSON.stringify(value)}.`,
    );
  }

  return value;
}
