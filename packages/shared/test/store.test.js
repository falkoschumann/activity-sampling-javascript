import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { createStore } from '../src/store.js';

describe('Store', () => {
  describe('Create store', () => {
    test('Creates store with initial state', () => {
      const store = new createStore(reducer, initialState);

      expect(store.getState()).toEqual(initialState);
    });

    test('Creates store and initializes state with reducer', () => {
      const store = new createStore(reducer);

      expect(store.getState()).toEqual(initialState);
    });
  });

  describe('Subscribe', () => {
    let store;

    beforeEach(() => {
      store = new createStore(reducer, { user: 'Alice' });
    });

    test('Does not emit event, if state is not changed', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'unknown-action' });

      expect(store.getState()).toEqual({ user: 'Alice' });
      expect(listener).not.toBeCalled();
    });

    test('Emits event, if state is changed', () => {
      const listener = jest.fn();
      store.subscribe(listener);

      store.dispatch({ type: 'user-changed', name: 'Bob' });

      expect(store.getState()).toEqual({ user: 'Bob' });
      expect(listener).toBeCalledTimes(1);
    });

    test('Does not emit event, if listener is unsubscribed', () => {
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);

      unsubscribe();
      store.dispatch({ type: 'user-changed', name: 'Bob' });

      expect(store.getState()).toEqual({ user: 'Bob' });
      expect(listener).not.toBeCalled();
    });
  });
});

const initialState = { user: '' };

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'user-changed':
      return { ...state, user: action.name };
    default:
      return state;
  }
}
