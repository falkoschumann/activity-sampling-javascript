/**
 * @jest-environment jsdom
 */

import { describe, expect, test } from '@jest/globals';

import { NotificationAdapter } from '../../src/infrastructure/notification-adapter';

describe('Notification adapter', () => {
  describe('Is supported', () => {
    test('Is supported', async () => {
      const notification = NotificationAdapter.createNull();

      expect(notification.isSupported).toEqual(true);
    });

    test('Is not supported', async () => {
      const notification = new NotificationAdapter();

      expect(notification.isSupported).toEqual(false);
    });
  });

  describe('Permission', () => {
    test('Is initial not set', async () => {
      const notification = NotificationAdapter.createNull();

      expect(notification.permission).toEqual('default');
    });

    test('Denies permission if notification is not supported', async () => {
      const notification = new NotificationAdapter(undefined);

      expect(notification.permission).toEqual('denied');
    });
  });

  describe('Request permission', () => {
    test('Requests permission', async () => {
      const notification = NotificationAdapter.createNull();

      const permission = await notification.requestPermission();

      expect(permission).toEqual('granted');
    });

    test('Denies permission if notification is not supported', async () => {
      const notification = new NotificationAdapter();

      const permission = await notification.requestPermission();

      expect(permission).toEqual('denied');
    });
  });

  describe('Show', () => {
    test('Shows notification', async () => {
      const notification = NotificationAdapter.createNull();

      await notification.show('Title', { body: 'Body', icon: 'Icon' });

      expect(notification.isVisible).toEqual(true);
    });

    test('Does nothing if notification is not supported', async () => {
      const notification = new NotificationAdapter();

      await notification.show('Title', { body: 'Body' });
    });
  });

  describe('Close', () => {
    test('Closes notification', async () => {
      const notification = NotificationAdapter.createNull();
      await notification.show('Title');

      await notification.close();

      expect(notification.isVisible).toEqual(false);
    });

    test('Does nothing if notification is not supported', async () => {
      const notification = new NotificationAdapter();
      await notification.show('Title');

      await notification.close();
    });
  });
});
