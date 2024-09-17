import { createStore } from '@muspellheim/utils';

import { reducer } from '../domain/reducer.js';

export const store = createStore(reducer);
