import { createStore } from '@activity-sampling/shared';

import { reducer } from '../domain/reducer.js';

const store = createStore(reducer);

export default store;
