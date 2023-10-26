import { expect } from '@jest/globals';
import { Duration } from '../src/index.js';

function areDurationsEqual(a, b) {
  let isADuration = a instanceof Duration;
  let isBDuration = b instanceof Duration;

  if (isADuration && isBDuration) {
    return a.equals(b);
  } else if (isADuration === isBDuration) {
    return undefined;
  } else {
    return false;
  }
}

expect.addEqualityTesters([areDurationsEqual]);
