import { reducer } from '../domain/reducer.js';
import { createStore } from '../util/store.js';

const store = createStore(reducer);

export default store;
