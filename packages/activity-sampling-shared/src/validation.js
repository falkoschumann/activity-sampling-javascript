export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
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

  return validateTypedProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );
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

  return validateTypedProperty(
    object,
    objectName,
    propertyName,
    propertyType,
    itemType,
  );
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
  const valueType = typeof value;
  if (valueType === 'object' && value instanceof propertyType) {
    return value;
  }

  const convertedValue = new propertyType(value);
  if (convertedValue.toString().startsWith('Invalid')) {
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
