import { AbstractApi } from '../infrastructure/api.js';

export async function getRecentActivities(api = new AbstractApi()) {
  return await api.getRecentActivities();
}
