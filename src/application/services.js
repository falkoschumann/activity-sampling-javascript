export async function getRecentActivities(repository) {
  let workingDays = [];
  let activities = await repository.findAll();
  for (let activity of activities) {
    let date = new Date(activity.timestamp);
    date.setUTCHours(0, 0, 0, 0);
    let index = workingDays.findIndex(
      (d) =>
        d.date.getFullYear() === date.getFullYear() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getDate() === date.getDate(),
    );
    if (index === -1) {
      workingDays.push({
        date,
        activities: [activity],
      });
      workingDays.sort((a, b) => b.date - a.date);
    } else {
      workingDays[index].activities.push(activity);
      workingDays[index].activities.sort((a, b) => b.timestamp - a.timestamp);
    }
  }
  return workingDays;
}
