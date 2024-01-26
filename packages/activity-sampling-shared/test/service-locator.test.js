import { describe, expect, test } from '@jest/globals';

import { ServiceLocator } from '../src/service-locator.js';

describe('Service locator', () => {
  test('Can register and resolve a service', () => {
    const locator = new ServiceLocator();
    const service = {};

    locator.register('service', service);
    const result = locator.resolve('service');

    expect(result).toBe(service);
  });

  test('Can register and resolve multiple services', () => {
    const locator = new ServiceLocator();
    const service1 = {};
    const service2 = {};

    locator.register('service1', service1);
    locator.register('service2', service2);
    const result1 = locator.resolve('service1');
    const result2 = locator.resolve('service2');

    expect(result1).toBe(service1);
    expect(result2).toBe(service2);
  });

  test('Creates a new instance of a service each time it is resolved', () => {
    const locator = new ServiceLocator();
    const serviceFactory = () => ({});

    locator.register('service', serviceFactory);
    const result1 = locator.resolve('service');
    const result2 = locator.resolve('service');

    expect(result1).not.toBe(result2);
  });

  test('Throws an error if a service is not registered', () => {
    const locator = new ServiceLocator();

    expect(() => locator.resolve('service')).toThrow(
      'Service not found: service',
    );
  });
});
