import { describe, expect, test } from '@jest/globals';

import {
  ensureAnything,
  ensureNonEmpty,
  ensureType,
  ensureOptionalType,
} from '../src/ensuring.js';
import { Enum } from '../src/enum.js';

describe('Validation', () => {
  describe('Ensure anything', () => {
    test('Returns value when parameter is present', () => {
      const result = ensureAnything('John');

      expect(result).toBe('John');
    });

    test('Fails when value is undefined', () => {
      expect(() => ensureAnything(undefined)).toThrow(
        /The value is required, but it was undefined\./,
      );
    });

    test('Fails when value is null', () => {
      expect(() => ensureAnything(null)).toThrow(
        /The value is required, but it was null\./,
      );
    });
  });

  describe('Ensure non empty', () => {
    test('Returns value when it is not empty', () => {
      const result = ensureNonEmpty('John');

      expect(result).toBe('John');
    });

    test('Fails when value is an empty string', () => {
      expect(() => ensureNonEmpty('')).toThrow(
        /The value must not be empty, but it was ""\./,
      );
    });

    test('Fails when value is an empty array', () => {
      expect(() => ensureNonEmpty([])).toThrow(
        /The value must not be empty, but it was \[\]\./,
      );
    });

    test('Fails when value is an empty object', () => {
      expect(() => ensureNonEmpty({})).toThrow(
        /The value must not be empty, but it was {}\./,
      );
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
          expect(() => ensureType('a', undefined)).toThrow(
            /The value must be undefined, but it was a string\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, undefined)).toThrow(
            /The value must be undefined, but it was null\./,
          );
        });
      });

      describe('Null', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(null, null);

          expect(result).toBe(null);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(1, null)).toThrow(
            /The value must be null, but it was a number\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, null)).toThrow(
            /The value must be null, but it was undefined\./,
          );
        });
      });

      describe('Boolean', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(true, Boolean);

          expect(result).toBe(true);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(1, Boolean)).toThrow(
            /The value must be a boolean, but it was a number\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Boolean)).toThrow(
            /The value must be a boolean, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Boolean)).toThrow(
            /The value must be a boolean, but it was null\./,
          );
        });
      });

      describe('Number', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(42, Number);

          expect(result).toBe(42);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('42', Number)).toThrow(
            /The value must be a number, but it was a string\./,
          );
        });

        test('Fails when value is not a number', () => {
          expect(() => ensureType(NaN, Number)).toThrow(
            /The value must be a number, but it was NaN\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Number)).toThrow(
            /The value must be a number, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Number)).toThrow(
            /The value must be a number, but it was null\./,
          );
        });
      });

      describe('BigInt', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType(BigInt(42), BigInt);

          expect(result).toBe(BigInt(42));
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(42, BigInt)).toThrow(
            /The value must be a bigint, but it was a number\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, BigInt)).toThrow(
            /The value must be a bigint, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, BigInt)).toThrow(
            /The value must be a bigint, but it was null\./,
          );
        });
      });

      describe('String', () => {
        test('Returns value when it is the expected type', () => {
          const result = ensureType('John', String);

          expect(result).toBe('John');
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType(123, String)).toThrow(
            /The value must be a string, but it was a number\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, String)).toThrow(
            /The value must be a string, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, String)).toThrow(
            /The value must be a string, but it was null\./,
          );
        });
      });

      describe('Symbol', () => {
        test('Returns value when it is the expected type', () => {
          const symbol = Symbol();
          const result = ensureType(symbol, Symbol);

          expect(result).toBe(symbol);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('John', Symbol)).toThrow(
            /The value must be a symbol, but it was a string\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Symbol)).toThrow(
            /The value must be a symbol, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Symbol)).toThrow(
            /The value must be a symbol, but it was null\./,
          );
        });
      });

      describe('Function', () => {
        test('Returns value when it is the expected type', () => {
          const func = () => {};
          const result = ensureType(func, Function);

          expect(result).toBe(func);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('John', Function)).toThrow(
            /The value must be a function, but it was a string\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Function)).toThrow(
            /The value must be a function, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Function)).toThrow(
            /The value must be a function, but it was null\./,
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
          expect(() => ensureType('John', Object)).toThrow(
            /The value must be an object, but it was a string\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Object)).toThrow(
            /The value must be an object, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Object)).toThrow(
            /The value must be an object, but it was null\./,
          );
        });
      });

      describe('Array', () => {
        test('Returns value when it is the expected type', () => {
          const array = ['John', 'Smith'];
          const result = ensureType(array, Array);

          expect(result).toBe(array);
        });

        test('Fails when value is not the expected type', () => {
          expect(() => ensureType('John', Array)).toThrow(
            /The value must be an array, but it was a string\./,
          );
        });

        test('Fails when value is undefined', () => {
          expect(() => ensureType(undefined, Array)).toThrow(
            /The value must be an array, but it was undefined\./,
          );
        });

        test('Fails when value is null', () => {
          expect(() => ensureType(null, Array)).toThrow(
            /The value must be an array, but it was null\./,
          );
        });

        test('Returns value when items has the expected type', () => {
          const names = ['John', 'Jane'];
          const result = ensureType(names, [String]);

          expect(result).toBe(names);
        });

        test('Fails when items does not have the expected type', () => {
          expect(() =>
            ensureType(['John', 123], [String], { name: 'names' }),
          ).toThrow(/The names.1 must be a string, but it was a number\./);
        });
      });
    });

    describe('Struct types', () => {
      test('Returns value when it is the expected type', () => {
        const result = ensureType(
          {
            name: 'John',
            birthDate: '1982-08-25',
            age: 42,
            isMarried: false,
            children: ['Alice', 'Bob'],
          },
          {
            name: String,
            birthDate: Date,
            age: Number,
            isMarried: Boolean,
            children: [String],
          },
        );

        expect(result).toEqual({
          name: 'John',
          birthDate: new Date('1982-08-25'),
          age: 42,
          isMarried: false,
          children: ['Alice', 'Bob'],
        });
      });

      test('Fails when value is not the expected type', () => {
        expect(() =>
          ensureType(
            { name: 'John', age: '42' },
            { name: String, age: Number },
            { name: 'User' },
          ),
        ).toThrow(/The User.age must be a number, but it was a string\./);
      });

      test('Fails when value is undefined', () => {
        expect(() =>
          ensureType(
            undefined,
            { name: String, age: Number },
            { name: 'User' },
          ),
        ).toThrow(/The User is required, but it was undefined\./);
      });

      test('Fails when value is null', () => {
        expect(() =>
          ensureType(null, { name: String, age: Number }, { name: 'User' }),
        ).toThrow(/The User is required, but it was null\./);
      });
    });

    describe('Constructor types', () => {
      test('Returns value when it is the expected type', () => {
        const date = new Date('2024-08-23T14:18');
        const result = ensureType(date, Date);

        expect(result).toBe(date);
      });

      test('Returns value when it can convert to the expected type', () => {
        const dateString = '2024-08-23T20:01';
        const result = ensureType(dateString, Date);

        expect(result).toEqual(new Date(dateString));
      });

      test('Fails when it can not convert to the expected type', () => {
        expect(() => ensureType('no-date', Date)).toThrow(
          /The value must be a valid Date, but it was a string: "no-date"\./,
        );
      });

      test('Fails when it it is undefined', () => {
        expect(() => ensureType(undefined, Date)).toThrow(
          /The value is required, but it was undefined\./,
        );
      });

      test('Fails when it it is null', () => {
        expect(() => ensureType(null, Date)).toThrow(
          /The value is required, but it was null\./,
        );
      });
    });

    describe('Enums', () => {
      test('Returns value when it is the expected type', () => {
        const constant = YesNo.YES;
        const result = ensureType(constant, YesNo);

        expect(result).toBe(constant);
      });

      test('Returns value when it can convert to the expected type', () => {
        const result = ensureType('no', YesNo);

        expect(result).toBe(YesNo.NO);
      });

      test('Fails when it can not convert to the expected type', () => {
        expect(() => ensureType('no-enum-constant', YesNo)).toThrow(
          /The value must be a YesNo, but it was a string\./,
        );
      });

      test('Fails when it it is undefined', () => {
        expect(() => ensureType(undefined, YesNo)).toThrow(
          /The value is required, but it was undefined\./,
        );
      });

      test('Fails when it it is null', () => {
        expect(() => ensureType(null, YesNo)).toThrow(
          /The value is required, but it was null\./,
        );
      });
    });
  });

  describe('Ensure optional type', () => {
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
      expect(() => ensureOptionalType(123, String)).toThrow(
        /The value must be a string, but it was a number\./,
      );
    });
  });

  test.todo('Ensure signature');
});

class YesNo extends Enum {
  static YES = new YesNo(0, 'YES');
  static NO = new YesNo(1, 'NO');
}