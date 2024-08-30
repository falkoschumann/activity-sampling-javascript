import { Application } from './ui/application.js';

// TODO Configure repositpory's filename

const port = process.env.PORT;
const app = Application.create();
app.start({ port });
