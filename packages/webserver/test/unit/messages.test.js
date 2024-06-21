import { describe, expect, test } from '@jest/globals';

import {
  LogActivity,
  RecentActivitiesQuery,
} from '../../src/domain/messages.js';
import { ValidationError } from '@activity-sampling/shared';

describe('Messages', () => {
  describe('Log activity', () => {
    describe('Validate', () => {
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
          new Error('The property "client" of LogActivity must not be empty.'),
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
          new Error('The property "project" of LogActivity must not be empty.'),
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
          new Error('The property "task" of LogActivity must not be empty.'),
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
});
