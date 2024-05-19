import { Application } from './ui/application.js';

const port = process.env.PORT;
const app = Application.create();
app.start({ port });
