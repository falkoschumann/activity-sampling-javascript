import { describe, expect, test } from '@jest/globals';

import {
  ensureAnything,
  ensureNonEmpty,
  ensureType,
  validateRequiredParameter,
  validateRequiredProperty,
  validateOptionalProperty,
  validateNonEmptyProperty,
  ValidationError,
  ensureOptionalType,
} from '../src/validation.js';
import { Enum } from '../src/enum.js';

describe('Validation', () => {
  describe('Ensure anything', () => {
    test('Returns value when parameter is present', () => {
      const result = ensureAnything('John');

      expect(result).toBe('John');
    });

    test('Fails when value is undefined', () => {
      expect(() => ensureAnything(undefined)).toThrow(ValidationError);
    });

    test('Fails when value is null', () => {
      expect(() => validateRequiredParameter(null)).toThrow(ValidationError);
    });
  });

  describe('Ensure non empty', () => {
    test('Returns value when it is not empty', () => {
      const result = ensureNonEmpty('John');

      expect(result).toBe('John');
    });

    test('Fails when value is an empty string', () => {
      expect(() => ensureNonEmpty('')).toThrow(ValidationError);
    });

    test('Fails when value is an empty array', () => {
      expect(() => ensureNonEmpty([])).toThrow(ValidationError);
    });

    test('Fails when value is an empty object', () => {
      expect(() => ensureNonEmpty({})).toThrow(ValidationError);
    });
  });

  describe('Ensure type', () => {
    describe('Built-in types', () => {
      describe('Undefined', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(undefined, undefined);

          expect(result).toBe(undefined);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(null, undefined)).toThrow(ValidationError);
        });
      });

      describe('Null', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(null, null);

          expect(result).toBe(null);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(undefined, null)).toThrow(ValidationError);
        });
      });

      describe('Boolean', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(true, Boolean);

          expect(result).toBe(true);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(1, Boolean)).toThrow(ValidationError);
        });
      });

      describe('Number', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(42, Number);

          expect(result).toBe(42);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('42', Number)).toThrow(ValidationError);
        });
      });

      describe('String', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType('John', String);

          expect(result).toBe('John');
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(123, String)).toThrow(ValidationError);
        });
      });

      describe('Object', () => {
        test('Returns value when it is the expected type', () => {
          const object = { name: 'John' };
          const result = ensureType(object, Object);

          expect(result).toBe(object);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('John', Object)).toThrow(ValidationError);
        });
      });
    });

    describe('Array', () => {
      test('Returns value when it is the expected type', () => {
        const array = ['John', 'Smith'];
        const result = ensureType(array, Array);

        expect(result).toBe(array);
      });

      test('Fails when value is not the expected type', () => {
        expect(() => ensureType('John', Array)).toThrow(ValidationError);
      });

      test('Returns value when items has the expected type', () => {
        const array = ['John', 'Jane'];
        const result = ensureType(array, [String]);

        expect(result).toBe(array);
      });

      test('Fails when items does not have the expected type', () => {
        expect(() => ensureType(['John', 123], [String])).toThrow(
          ValidationError,
        );
      });
    });

    describe('Object', () => {
      test('Returns value when it is the expected type', () => {
        const object = { name: 'John' };
        const result = ensureType(object, Object);

        expect(result).toBe(object);
      });

      test('Fails when value is not the expected type', () => {
        expect(() => ensureType('John', Object)).toThrow(ValidationError);
      });
    });

    describe('Struct types', () => {
      test('Returns value when it is the expected type', () => {
        const struct = {
          name: 'John',
          age: 42,
          isMarried: false,
          children: ['Alice', 'Bob'],
        };
        const result = ensureType(struct, {
          name: String,
          age: Number,
          isMarried: Boolean,
          children: [String],
        });

        expect(result).toBe(struct);
      });

      test('Fails when value is not the expected type', () => {
        expect(() =>
          ensureType(
            { name: 'John', age: '42' },
            { name: String, age: Number },
          ),
        ).toThrow(ValidationError);
      });
    });

    describe('Constructor types', () => {
      test('Returns value when it is the expected type', () => {
        const date = new Date('2024-08-23T14:18');
        const result = ensureType(date, Date);

        expect(result).toBe(date);
      });

      test('Fails when value is not the expected type', () => {
        expect(() => ensureType('no-date', Date)).toThrow(ValidationError);
      });

      test('Returns value when it can convert to the expected type', () => {
        const dateString = '2024-08-23T20:01';
        const result = ensureType(dateString, Date);

        expect(result).toEqual(new Date(dateString));
      });

      test('Fails when it can not convert to the expected type', () => {
        expect(() => ensureType('no-date', Date)).toThrow(ValidationError);
      });
    });

    describe('Enums', () => {
      test('Returns value when it is the expected type', () => {
        const constant = YesNo.YES;
        const result = ensureType(constant, YesNo);

        expect(result).toBe(constant);
      });

      test('Fails when value is not the expected type', () => {
        expect(() => ensureType(42, YesNo)).toThrow(ValidationError);
      });

      test('Returns value when it can convert to the expected type', () => {
        const result = ensureType('no', YesNo);

        expect(result).toBe(YesNo.NO);
      });

      test('Fails when it can not convert to the expected type', () => {
        expect(() => ensureType('no-enum-constant', YesNo)).toThrow(
          ValidationError,
        );
      });
    });
  });

  describe('Ensure type', () => {
    test('Returns value when parameter is present', () => {
      const result = ensureOptionalType('John', String);

      expect(result).toBe('John');
    });

    test('Returns value when parameter is undefined', () => {
      const result = ensureOptionalType(undefined, String);

      expect(result).toBeUndefined();
    });

    test('Returns value when parameter is null', () => {
      const result = ensureOptionalType(null, String);

      expect(result).toBeNull();
    });

    test('Fails when parameter is not the expected type', () => {
      expect(() => ensureOptionalType(123, String)).toThrow(ValidationError);
    });
  });

  test.todo('Ensure signature');

  describe('Required parameter', () => {
    test('Returns value when parameter is present', () => {
      const result = validateRequiredParameter('John', 'name');

      expect(result).toEqual('John');
    });

    test('Fails when parameter is undefined', () => {
      expect(() => validateRequiredParameter(undefined, 'name')).toThrow(
        new Error('The parameter "name" is required.'),
      );
    });

    test('Fails when parameter is null', () => {
      expect(() => validateRequiredParameter(null, 'name')).toThrow(
        new Error('The parameter "name" is required.'),
      );
    });

    test('Returns value when parameter is an expected primitive type', () => {
      const result = validateRequiredParameter('John', 'name', 'string');

      expect(result).toEqual('John');
    });

    test('Fails when parameter is not an expected primitive type', () => {
      expect(() => validateRequiredParameter(123, 'name', 'string')).toThrow(
        new Error('The parameter "name" must be a string, found number: 123.'),
      );
    });
  });

  describe('Non empty property', () => {
    test('Fails when string property is an empty string', () => {
      const user = { name: '' };

      expect(() =>
        validateNonEmptyProperty(user, 'user', 'name', 'string'),
      ).toThrow(
        new Error('The property "name" of user must not be an empty string.'),
      );
    });

    test('Fails when array property is an empty array', () => {
      const user = { roles: [] };

      expect(() =>
        validateNonEmptyProperty(user, 'user', 'roles', 'array'),
      ).toThrow(
        new Error('The property "roles" of user must not be an empty array.'),
      );
    });
  });

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

    test('Returns constant when property is an expected enum constant', () => {
      const user = { isMarried: YesNo.YES };

      const isMarried = validateRequiredProperty(
        user,
        'user',
        'isMarried',
        YesNo,
      );

      expect(isMarried).toEqual(YesNo.YES);
    });

    test('Returns constant when property can convert to an expected enum constant', () => {
      const user = { isMarried: 'yes' };

      const isMarried = validateRequiredProperty(
        user,
        'user',
        'isMarried',
        YesNo,
      );

      expect(isMarried).toEqual(YesNo.YES);
    });

    test('Fails when property can not convert an expected enum constant', () => {
      const user = { isMarried: 'no-enum-name' };

      expect(() =>
        validateRequiredProperty(user, 'user', 'isMarried', YesNo),
      ).toThrow(
        new Error(
          'The property "isMarried" of user must be a valid YesNo, found string: "no-enum-name".',
        ),
      );
    });

    test('Fails when property can not convert an expected enum constant', () => {
      const user = { isMarried: 5 };

      expect(() =>
        validateRequiredProperty(user, 'user', 'isMarried', YesNo),
      ).toThrow(
        new Error(
          'The property "isMarried" of user must be a valid YesNo, found number: 5.',
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

class YesNo extends Enum {
  static YES = new YesNo(0, 'YES');
  static NO = new YesNo(1, 'NO');
}
