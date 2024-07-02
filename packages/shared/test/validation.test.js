import { describe, expect, test } from '@jest/globals';

import {
  validateRequiredProperty,
  validateOptionalProperty,
} from '../src/validation.js';

describe('Validation', () => {
  describe('Required property', () => {
    test('Returns value when property is present', () => {
      const user = { name: 'John' };

      const name = validateRequiredProperty(user, 'user', 'name');

      expect(name).toEqual('John');
    });

    test('Fails when object is missing', () => {
      expect(() => validateRequiredProperty(undefined, 'user')).toThrow(
        new Error('The user is required.'),
      );
    });

    test('Fails when property is undefined', () => {
      const user = {};

      expect(() => validateRequiredProperty(user, 'user', 'name')).toThrow(
        new Error('The property "name" is required for user.'),
      );
    });

    test('Fails when property is null', () => {
      const user = { name: null };

      expect(() => validateRequiredProperty(user, 'user', 'name')).toThrow(
        new Error('The property "name" is required for user.'),
      );
    });

    test('Fails when string property is an empty string', () => {
      const user = { name: '' };

      expect(() =>
        validateRequiredProperty(user, 'user', 'name', 'string'),
      ).toThrow(
        new Error('The property "name" of user must not be an empty string.'),
      );
    });

    test.skip('Fails when array property is an empty array', () => {
      const user = { roles: [] };

      expect(() =>
        validateRequiredProperty(user, 'user', 'roles', 'array'),
      ).toThrow(
        new Error('The property "roles" of user must not be an empty array.'),
      );
    });
  });

  describe('Optional property', () => {
    test('Returns value when property is present', () => {
      const user = { name: 'John' };

      const name = validateOptionalProperty(user, 'user', 'name');

      expect(name).toEqual('John');
    });

    test('Fails when object is missing', () => {
      expect(() => validateOptionalProperty(undefined, 'user')).toThrow(
        new Error('The user is required.'),
      );
    });

    test('Returns undefined when property is missing', () => {
      const user = {};

      const name = validateOptionalProperty(user, 'user', 'name', 'string');

      expect(name).toBeUndefined();
    });

    test('Returns null when property is null', () => {
      const user = { name: null };

      const name = validateOptionalProperty(user, 'user', 'name', 'string');

      expect(name).toBeNull();
    });
  });

  describe('Typed property', () => {
    test('Returns value when property is an expected primitive type', () => {
      const user = { name: 'John' };

      const name = validateRequiredProperty(user, 'user', 'name', 'string');

      expect(name).toEqual('John');
    });

    test('Fails when property is not an expected primitive type', () => {
      const user = { name: 123 };

      expect(() =>
        validateRequiredProperty(user, 'user', 'name', 'string'),
      ).toThrow(
        new Error(
          'The property "name" of user must be a string, found number: 123.',
        ),
      );
    });

    test('Returns value when property is an expected object type', () => {
      const user = { dayOfBirth: new Date('1985-02-17') };

      const dayObBirth = validateRequiredProperty(
        user,
        'user',
        'dayOfBirth',
        Date,
      );

      expect(dayObBirth).toEqual(new Date('1985-02-17'));
    });

    test('Returns value when property can convert to an expected object type', () => {
      const user = { dayOfBirth: '1985-02-17' };

      const dayObBirth = validateRequiredProperty(
        user,
        'user',
        'dayOfBirth',
        Date,
      );

      expect(dayObBirth).toEqual(new Date('1985-02-17'));
    });

    test('Fails when property can not convert an expected object type', () => {
      const user = { dayOfBirth: 'no-date' };

      expect(() =>
        validateRequiredProperty(user, 'user', 'dayOfBirth', Date),
      ).toThrow(
        new Error(
          'The property "dayOfBirth" of user must be a valid Date, found string: "no-date".',
        ),
      );
    });

    test('Returns value when property is an object', () => {
      const user = { address: { street: 'Test street', city: 'Test city' } };

      const address = validateRequiredProperty(
        user,
        'user',
        'address',
        'object',
      );

      expect(address).toEqual({ street: 'Test street', city: 'Test city' });
    });

    test('Fails when property is not an object', () => {
      const user = { address: 'not an object' };

      expect(() =>
        validateRequiredProperty(user, 'user', 'address', 'object'),
      ).toThrow(
        new Error(
          'The property "address" of user must be an object, found string: "not an object".',
        ),
      );
    });

    test('Fails when property is not an object also it is an array', () => {
      const user = { address: ['not an object'] };

      expect(() =>
        validateRequiredProperty(user, 'user', 'address', 'object'),
      ).toThrow(
        new Error(
          'The property "address" of user must be an object, found array: ["not an object"].',
        ),
      );
    });

    test('Returns value when property is an array', () => {
      const user = { roles: ['admin', 'user'] };

      const roles = validateRequiredProperty(user, 'user', 'roles', 'array');

      expect(roles).toEqual(['admin', 'user']);
    });

    test('Fails when property is not an array', () => {
      const user = { roles: 'admin' };

      expect(() =>
        validateRequiredProperty(user, 'user', 'roles', 'array'),
      ).toThrow(
        new Error(
          'The property "roles" of user must be an array, found string: "admin".',
        ),
      );
    });

    test('Returns value when property is an array of an expected type', () => {
      const user = { roles: ['admin', 'user'] };

      const roles = validateRequiredProperty(
        user,
        'user',
        'roles',
        'array',
        'string',
      );

      expect(roles).toEqual(['admin', 'user']);
    });

    test('Fails when property is not an array of an expected type', () => {
      const user = { roles: ['admin', 123] };

      expect(() =>
        validateRequiredProperty(user, 'user', 'roles', 'array', 'string'),
      ).toThrow(
        new Error(
          'The property "roles" of user must be an array of strings, found number at #2: 123.',
        ),
      );
    });
  });
});
