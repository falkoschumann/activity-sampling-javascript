import { getRecentActivities } from '../application/services.js';
import { Api } from '../infrastructure/api.js';

const api = new Api();

export async function getRecentActivitiesAction() {
  return await getRecentActivities(api);
}
