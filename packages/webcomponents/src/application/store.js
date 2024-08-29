import { createStore } from '@activity-sampling/utils';

import { reducer } from '../domain/reducer.js';

export const store = createStore(reducer);
