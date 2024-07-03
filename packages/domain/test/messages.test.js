import { describe, expect, test } from '@jest/globals';

import { ValidationError } from '@activity-sampling/utils';
import {
  Activity,
  LogActivity,
  RecentActivities,
  RecentActivitiesQuery,
  TimeSummary,
  WorkingDay,
} from '../src/messages.js';

describe('Messages', () => {
  describe('Log activity', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = LogActivity.create({
          timestamp: '2024-06-20T10:30Z',
          duration: 'PT30M',
          client: 'Test client',
          project: 'Test project',
          task: 'Test task',
          notes: 'Test notes',
        });

        const result = dto.validate();

        expect(result).toEqual(LogActivity.createTestInstance());
      });

      test('Reports an error, if timestamp is missing', () => {
        const dto = LogActivity.create({
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "timestamp" is required for LogActivity.'),
        );
      });

      test('Reports an error, if timestamp is invalid', () => {
        const dto = LogActivity.create({
          timestamp: '2024-13-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "timestamp" of LogActivity must be a valid Date, found string: "2024-13-02T11:35Z".',
          ),
        );
      });

      test('Reports an error, if duration is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "duration" is required for LogActivity.'),
        );
      });

      test('Reports an error, if duration is invalid', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: '30m',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "duration" of LogActivity must be a valid Duration, found string: "30m".',
          ),
        );
      });

      test('Reports an error, if client is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "client" is required for LogActivity.'),
        );
      });

      test('Reports an error, if client is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: '',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "client" of LogActivity must not be an empty string.',
          ),
        );
      });

      test('Reports an error, if project is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "project" is required for LogActivity.'),
        );
      });

      test('Reports an error, if project is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: '',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "project" of LogActivity must not be an empty string.',
          ),
        );
      });

      test('Reports an error, if task is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "task" is required for LogActivity.'),
        );
      });

      test('Reports an error, if task is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: '',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "task" of LogActivity must not be an empty string.',
          ),
        );
      });

      test('Reports no error, if notes is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });

      test('Reports no error, if notes is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: '',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });
    });
  });

  describe('Recent activities query', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = RecentActivitiesQuery.create({
          today: '2024-06-20T08:00Z',
        });

        const result = dto.validate();

        expect(result).toEqual(RecentActivitiesQuery.createTestInstance());
      });

      test('Reports no error, if today is missing', () => {
        const dto = RecentActivitiesQuery.create();

        expect(() => dto.validate()).not.toThrow();
      });

      test('Reports an error, if today is invalid', () => {
        const dto = RecentActivitiesQuery.create({
          today: '2024-13-02T11:35Z',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "today" of RecentActivitiesQuery must be a valid Date, found string: "2024-13-02T11:35Z".',
          ),
        );
      });
    });
  });

  describe('Recent activities', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              date: '2024-06-20T00:00',
              activities: [
                {
                  timestamp: '2024-06-20T12:30',
                  duration: 'PT30M',
                  client: 'Test client',
                  project: 'Test project',
                  task: 'Test task',
                  notes: 'Test notes',
                },
              ],
            },
          ],
          timeSummary: {
            hoursToday: 'PT30M',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        const result = dto.validate();

        expect(result).toEqual(RecentActivities.createTestInstance());
      });

      test('Reports an error, if workingDays is missing', () => {
        const dto = RecentActivities.create({
          timeSummary: {
            hoursToday: 'PT30M',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "workingDays" is required for RecentActivities.',
          ),
        );
      });

      test('Reports an error, if workingDays is not an array', () => {
        const dto = RecentActivities.create({
          workingDays: 'not an array',
          timeSummary: {
            hoursToday: 'PT30M',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "workingDays" of RecentActivities must be an array, found string: "not an array".',
          ),
        );
      });

      test('Reports an error, if activities does not contains activities', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              activities: [
                {
                  timestamp: '2024-06-20T12:30',
                  duration: 'PT30M',
                  client: 'Test client',
                  project: 'Test project',
                  task: 'Test task',
                  notes: 'Test notes',
                },
              ],
            },
          ],
          timeSummary: {
            hoursToday: 'PT30M',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "date" is required for WorkingDay.'),
        );
      });

      test('Reports an error, if timeSummary is missing', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              date: '2024-06-20T00:00',
              activities: [
                {
                  timestamp: '2024-06-20T12:30',
                  duration: 'PT30M',
                  client: 'Test client',
                  project: 'Test project',
                  task: 'Test task',
                  notes: 'Test notes',
                },
              ],
            },
          ],
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "timeSummary" is required for RecentActivities.',
          ),
        );
      });

      test('Reports an error, if date is invalid', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              date: '2024-06-20T00:00',
              activities: [
                {
                  timestamp: '2024-06-20T12:30',
                  duration: 'PT30M',
                  client: 'Test client',
                  project: 'Test project',
                  task: 'Test task',
                  notes: 'Test notes',
                },
              ],
            },
          ],
          timeSummary: {
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "hoursToday" is required for TimeSummary.'),
        );
      });
    });
  });

  describe('Working day', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = WorkingDay.create({
          date: '2024-06-20T00:00',
          activities: [
            {
              timestamp: '2024-06-20T12:30',
              duration: 'PT30M',
              client: 'Test client',
              project: 'Test project',
              task: 'Test task',
              notes: 'Test notes',
            },
          ],
        });

        const result = dto.validate();

        expect(result).toEqual(WorkingDay.createTestInstance());
      });

      test('Reports an error, if date is missing', () => {
        const dto = WorkingDay.create({
          activities: [
            {
              timestamp: '2024-06-20T12:30',
              duration: 'PT30M',
              client: 'Test client',
              project: 'Test project',
              task: 'Test task',
              notes: 'Test notes',
            },
          ],
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "date" is required for WorkingDay.'),
        );
      });

      test('Reports an error, if date is invalid', () => {
        const dto = WorkingDay.create({
          date: '2024-13-20T00:00',
          activities: [
            {
              timestamp: '2024-06-20T12:30',
              duration: 'PT30M',
              client: 'Test client',
              project: 'Test project',
              task: 'Test task',
              notes: 'Test notes',
            },
          ],
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "date" of WorkingDay must be a valid Date, found string: "2024-13-20T00:00".',
          ),
        );
      });

      test('Reports an error, if activities is missing', () => {
        const dto = WorkingDay.create({ date: '2024-06-20T00:00' });

        expect(() => dto.validate()).toThrow(
          new Error('The property "activities" is required for WorkingDay.'),
        );
      });

      test('Reports an error, if activities is not an array', () => {
        const dto = WorkingDay.create({
          date: '2024-06-20T00:00',
          activities: 'not an array',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "activities" of WorkingDay must be an array, found string: "not an array".',
          ),
        );
      });

      test('Reports an error, if activities does not contains activities', () => {
        const dto = WorkingDay.create({
          date: '2024-06-20T00:00',
          activities: [
            {
              duration: 'PT30M',
              client: 'Test client',
              project: 'Test project',
              task: 'Test task',
              notes: 'Test notes',
            },
          ],
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "timestamp" is required for Activity.'),
        );
      });
    });
  });

  describe('Activity', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = Activity.create({
          timestamp: '2024-06-20T10:30Z',
          duration: 'PT30M',
          client: 'Test client',
          project: 'Test project',
          task: 'Test task',
          notes: 'Test notes',
        });

        const result = dto.validate();

        expect(result).toEqual(Activity.createTestInstance());
      });

      test('Reports an error, if timestamp is missing', () => {
        const dto = Activity.create({
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "timestamp" is required for Activity.'),
        );
      });

      test('Reports an error, if timestamp is invalid', () => {
        const dto = Activity.create({
          timestamp: '2024-13-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "timestamp" of Activity must be a valid Date, found string: "2024-13-02T11:35Z".',
          ),
        );
      });

      test('Reports an error, if duration is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "duration" is required for Activity.'),
        );
      });

      test('Reports an error, if duration is invalid', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: '30m',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "duration" of Activity must be a valid Duration, found string: "30m".',
          ),
        );
      });

      test('Reports an error, if client is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "client" is required for Activity.'),
        );
      });

      test('Reports an error, if client is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: '',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "client" of Activity must not be an empty string.',
          ),
        );
      });

      test('Reports an error, if project is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "project" is required for Activity.'),
        );
      });

      test('Reports an error, if project is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: '',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "project" of Activity must not be an empty string.',
          ),
        );
      });

      test('Reports an error, if task is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "task" is required for Activity.'),
        );
      });

      test('Reports an error, if task is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: '',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "task" of Activity must not be an empty string.',
          ),
        );
      });

      test('Reports no error, if notes is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });

      test('Reports no error, if notes is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: '',
        });

        expect(() => dto.validate()).not.toThrow(ValidationError);
      });
    });
  });

  describe('Time summary', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        const result = dto.validate();

        expect(result).toEqual(TimeSummary.createTestInstance());
      });

      test('Reports an error, if hoursToday is missing', () => {
        const dto = TimeSummary.create({
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error('The property "hoursToday" is required for TimeSummary.'),
        );
      });

      test('Reports an error, if hoursToday is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: '30m',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursToday" of TimeSummary must be a valid Duration, found string: "30m".',
          ),
        );
      });

      test('Reports an error, if hoursYesterday is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursYesterday" is required for TimeSummary.',
          ),
        );
      });

      test('Reports an error, if hoursYesterday is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: '0m',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursYesterday" of TimeSummary must be a valid Duration, found string: "0m".',
          ),
        );
      });

      test('Reports an error, if hoursThisWeek is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursThisWeek" is required for TimeSummary.',
          ),
        );
      });

      test('Reports an error, if hoursThisWeek is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: '30m',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursThisWeek" of TimeSummary must be a valid Duration, found string: "30m".',
          ),
        );
      });

      test('Reports an error, if hoursThisMonth is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursThisMonth" is required for TimeSummary.',
          ),
        );
      });

      test('Reports an error, if hoursThisMonth is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: '30m',
        });

        expect(() => dto.validate()).toThrow(
          new Error(
            'The property "hoursThisMonth" of TimeSummary must be a valid Duration, found string: "30m".',
          ),
        );
      });
    });
  });
});
