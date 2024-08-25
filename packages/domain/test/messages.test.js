import { describe, expect, test } from '@jest/globals';

import { Duration } from '@activity-sampling/utils';

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

      test('Fails when timestamp is missing', () => {
        const dto = LogActivity.create({
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.timestamp is required, but it was undefined\./,
        );
      });

      test('Fails when timestamp is invalid', () => {
        const dto = LogActivity.create({
          timestamp: '2024-13-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.timestamp must be a valid Date, but it was a string: "2024-13-02T11:35Z"\./,
        );
      });

      test('Fails when duration is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.duration is required, but it was undefined\./,
        );
      });

      test('Fails when duration is invalid', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: '30m',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.duration must be a valid Duration, but it was a string: "30m"\./,
        );
      });

      test('Fails when client is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.client must be a string, but it was undefined\./,
        );
      });

      test('Fails when client is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: '',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.client must not be empty, but it was ""\./,
        );
      });

      test('Fails when project is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.project must be a string, but it was undefined\./,
        );
      });

      test('Fails when project is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: '',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.project must not be empty, but it was ""\./,
        );
      });

      test('Fails when task is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.task must be a string, but it was undefined\./,
        );
      });

      test('Fails when task is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: '',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.task must not be empty, but it was ""\./,
        );
      });

      test.skip('Does not fail when notes is missing', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
        });

        expect(() => dto.validate()).not.toThrow();
      });

      test('Fails when notes is empty', () => {
        const dto = LogActivity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: '',
        });

        expect(() => dto.validate()).toThrow(
          /The LogActivity\.notes must not be empty, but it was ""\./,
        );
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

      test('Fails when today is invalid', () => {
        const dto = RecentActivitiesQuery.create({
          today: '2024-13-02T11:35Z',
        });

        expect(() => dto.validate()).toThrow(
          /The RecentActivitiesQuery\.today must be a valid Date, but it was a string: "2024-13-02T11:35Z"\./,
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
              activities: [Activity.createTestInstance()],
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

      test('Fails when workingDays is missing', () => {
        const dto = RecentActivities.create({
          timeSummary: {
            hoursToday: 'PT30M',
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          /The RecentActivities\.workingDays must be an array, but it was undefined\./,
        );
      });

      test('Fails when workingDays is not an array', () => {
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
          /The RecentActivities\.workingDays must be an array, but it was a string\./,
        );
      });

      test('Fails when activities does not contains activities', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              activities: [Activity.createTestInstance()],
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
          /The RecentActivities\.workingDays.0.date is required, but it was undefined\./,
        );
      });

      test('Fails when timeSummary is missing', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              date: '2024-06-20T00:00',
              activities: [Activity.createTestInstance()],
            },
          ],
        });

        expect(() => dto.validate()).toThrow(
          /The RecentActivities\.timeSummary must be an object, but it was undefined\./,
        );
      });

      test('Fails when date is invalid', () => {
        const dto = RecentActivities.create({
          workingDays: [
            {
              date: '2024-06-20T00:00',
              activities: [Activity.createTestInstance()],
            },
          ],
          timeSummary: {
            hoursYesterday: 'PT0S',
            hoursThisWeek: 'PT30M',
            hoursThisMonth: 'PT30M',
          },
        });

        expect(() => dto.validate()).toThrow(
          /The RecentActivities.timeSummary.hoursToday is required, but it was undefined\./,
        );
      });
    });
  });

  describe('Working day', () => {
    describe('Validate', () => {
      test('Validates successfully', () => {
        const dto = WorkingDay.create({
          date: '2024-06-20T00:00',
          activities: [Activity.createTestInstance()],
        });

        const result = dto.validate();

        expect(result).toEqual(WorkingDay.createTestInstance());
      });

      test('Fails when date is missing', () => {
        const dto = WorkingDay.create({
          activities: [Activity.createTestInstance()],
        });

        expect(() => dto.validate()).toThrow(
          /The WorkingDay\.date is required, but it was undefined\./,
        );
      });

      test('Fails when date is invalid', () => {
        const dto = WorkingDay.create({
          date: '2024-13-20T00:00',
          activities: [Activity.createTestInstance()],
        });

        expect(() => dto.validate()).toThrow(
          /The WorkingDay\.date must be a valid Date, but it was a string: "2024-13-20T00:00"\./,
        );
      });

      test('Fails when activities is missing', () => {
        const dto = WorkingDay.create({ date: '2024-06-20T00:00' });

        expect(() => dto.validate()).toThrow(
          /The WorkingDay\.activities must be an array, but it was undefined\./,
        );
      });

      test('Fails when activities is not an array', () => {
        const dto = WorkingDay.create({
          date: '2024-06-20T00:00',
          activities: 'not an array',
        });

        expect(() => dto.validate()).toThrow(
          /The WorkingDay\.activities must be an array, but it was a string\./,
        );
      });

      test('Fails when activities does not contains activities', () => {
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
          /The WorkingDay\.activities\.0\.timestamp is required, but it was undefined\./,
        );
      });
    });
  });

  describe('Activity', () => {
    describe('Validate', () => {
      test.skip('Validates successfully only with required properties', () => {
        const dto = Activity.create({
          timestamp: '2024-06-20T10:30Z',
          duration: 'PT30M',
          client: 'Test client',
          project: 'Test project',
          task: 'Test task',
        });

        const result = dto.validate();

        expect(result).toEqual(Activity.createTestInstance());
      });

      test('Validates successfully with all properties', () => {
        const dto = Activity.create({
          timestamp: '2024-06-20T10:30Z',
          duration: 'PT30M',
          client: 'Test client',
          project: 'Test project',
          task: 'Test task',
          notes: 'Test notes',
        });

        const result = dto.validate();

        expect(result).toEqual(
          Activity.createTestInstance({ notes: 'Test notes' }),
        );
      });

      test('Fails when timestamp is missing', () => {
        const dto = Activity.create({
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.timestamp is required, but it was undefined\./,
        );
      });

      test('Fails when timestamp is invalid', () => {
        const dto = Activity.create({
          timestamp: '2024-13-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.timestamp must be a valid Date, but it was a string: "2024-13-02T11:35Z"\./,
        );
      });

      test('Fails when duration is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.duration is required, but it was undefined\./,
        );
      });

      test('Fails when duration is invalid', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: '30m',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.duration must be a valid Duration, but it was a string: "30m"\./,
        );
      });

      test('Fails when client is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.client must be a string, but it was undefined\./,
        );
      });

      test('Fails when client is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: '',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.client must not be empty, but it was ""\./,
        );
      });

      test('Fails when project is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.project must be a string, but it was undefined\./,
        );
      });

      test('Fails when project is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: '',
          task: 'Recent Activities',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.project must not be empty, but it was ""\./,
        );
      });

      test('Fails when task is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.task must be a string, but it was undefined\./,
        );
      });

      test('Fails when task is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: '',
          notes: 'Show my recent activities',
        });

        expect(() => dto.validate()).toThrow(
          /The Activity\.task must not be empty, but it was ""\./,
        );
      });

      test.skip('Assumes notes as empty string, if notes is missing', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
        });

        const result = dto.validate();

        expect(result).toEqual(
          Activity.create({
            timestamp: new Date('2024-04-02T11:35Z'),
            duration: new Duration('PT30M'),
            client: 'Muspellheim',
            project: 'Activity Sampling',
            task: 'Recent Activities',
            notes: '',
          }),
        );
      });

      test('Does not fail when notes is empty', () => {
        const dto = Activity.create({
          timestamp: '2024-04-02T11:35Z',
          duration: 'PT30M',
          client: 'Muspellheim',
          project: 'Activity Sampling',
          task: 'Recent Activities',
          notes: '',
        });

        const result = dto.validate();

        expect(result).toEqual(
          Activity.create({
            timestamp: new Date('2024-04-02T11:35Z'),
            duration: new Duration('PT30M'),
            client: 'Muspellheim',
            project: 'Activity Sampling',
            task: 'Recent Activities',
            notes: '',
          }),
        );
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

      test('Fails when hoursToday is missing', () => {
        const dto = TimeSummary.create({
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursToday is required, but it was undefined\./,
        );
      });

      test('Fails when hoursToday is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: '30m',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursToday must be a valid Duration, but it was a string: "30m"\./,
        );
      });

      test('Fails when hoursYesterday is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursYesterday is required, but it was undefined\./,
        );
      });

      test('Fails when hoursYesterday is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: '0m',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursYesterday must be a valid Duration, but it was a string: "0m"\./,
        );
      });

      test('Fails when hoursThisWeek is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursThisWeek is required, but it was undefined\./,
        );
      });

      test('Fails when hoursThisWeek is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: '30m',
          hoursThisMonth: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursThisWeek must be a valid Duration, but it was a string: "30m"\./,
        );
      });

      test('Fails when hoursThisMonth is missing', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursThisMonth is required, but it was undefined\./,
        );
      });

      test('Fails when hoursThisMonth is invalid', () => {
        const dto = TimeSummary.create({
          hoursToday: 'PT30M',
          hoursYesterday: 'PT0S',
          hoursThisWeek: 'PT30M',
          hoursThisMonth: '30m',
        });

        expect(() => dto.validate()).toThrow(
          /The TimeSummary\.hoursThisMonth must be a valid Duration, but it was a string: "30m"\./,
        );
      });
    });
  });
});
