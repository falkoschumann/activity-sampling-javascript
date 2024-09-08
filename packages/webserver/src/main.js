import { Application } from './ui/application.js';

const activityLogFile = process.env.ACTIVITY_LOG_FILE;
const port = process.env.PORT;
const app = Application.create({ activityLogFile });
app.start({ port });
