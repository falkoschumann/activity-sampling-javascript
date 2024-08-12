import { OutputTracker } from '@activity-sampling/utils';

const NOTIFICATION_SHOWN_EVENT = 'notification-shown';
const NOTIFICATION_CLOSED_EVENT = 'notification-closed';

export class NotificationAdapter extends EventTarget {
  static create() {
    return new NotificationAdapter(globalThis.Notification);
  }

  static createNull() {
    return new NotificationAdapter(NotificationStub);
  }

  #notificationConstructor;
  /** @type {?Notification} */ #notification;
  #isVisible = false;

  constructor(/** @type {typeof Notification} */ notificationConstructor) {
    super();
    this.#notificationConstructor = notificationConstructor;
  }

  get isSupported() {
    return this.#notificationConstructor != null;
  }

  get permission() {
    if (this.#notificationConstructor == null) {
      return 'denied';
    }

    return this.#notificationConstructor.permission;
  }

  get isVisible() {
    return this.#isVisible;
  }

  async requestPermission() {
    if (this.#notificationConstructor == null) {
      return 'denied';
    }

    return this.#notificationConstructor.requestPermission();
  }

  async show(
    /** @type {string} */ title,
    /** @type {NotificationOptions} */ options,
  ) {
    if (this.#notificationConstructor == null) {
      return;
    }
    if (this.#notification != null) {
      await this.close();
    }

    console.log('NotificationAdapter.show');
    await new Promise((resolve, reject) => {
      this.#notification = new this.#notificationConstructor(title, options);
      this.#notification.addEventListener('show', () => {
        console.log('NotificationAdapter.shown');
        this.#isVisible = true;
        resolve();
      });
      this.#notification.addEventListener('click', () => {
        window.focus();
        this.#notification.close();
      });
      this.#notification.addEventListener('close', () => {
        console.log('NotificationAdapter.closed 1');
        this.#isVisible = false;
        this.#notification = null;
      });
      this.#notification.addEventListener('error', reject);
    });

    this.dispatchEvent(
      new CustomEvent(NOTIFICATION_SHOWN_EVENT, { detail: { title } }),
    );
  }

  trackShow() {
    return OutputTracker.create(this, NOTIFICATION_SHOWN_EVENT);
  }

  async close() {
    if (this.#notification == null) {
      return;
    }

    console.log('NotificationAdapter.close');
    const title = this.#notification.title;
    await new Promise((resolve) => {
      this.#notification.addEventListener('close', () => {
        console.log('NotificationAdapter.closed 2');
        this.#isVisible = false;
        this.#notification = null;
        resolve();
      });
      this.#notification.close();
    });
    this.dispatchEvent(
      new CustomEvent(NOTIFICATION_CLOSED_EVENT, {
        detail: { title },
      }),
    );
  }

  trackClose() {
    return OutputTracker.create(this, NOTIFICATION_CLOSED_EVENT);
  }
}

class NotificationStub extends EventTarget {
  static #permission = 'default';

  static get permission() {
    return this.#permission;
  }

  static async requestPermission() {
    this.#permission = 'granted';
    return this.#permission;
  }

  constructor(title) {
    super();
    this.title = title;
    console.log('NotificationStub created:', title);
    setTimeout(() => this.dispatchEvent(new Event('show')));
  }

  close() {
    console.log('NotificationStub closed:', this.title);
    setTimeout(() => this.dispatchEvent(new Event('close')));
  }
}