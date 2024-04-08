/*import { ExpressApp } from './ui/express-app.js';

let app = new ExpressApp();
app.run();
*/

import path from 'node:path';
import express from 'express';

const __dirname = new URL('.', import.meta.url).pathname;

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../../../spec')));
/*
app.get('/', (req, res) => {
  res.send('Hello World!');
});
*/
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
