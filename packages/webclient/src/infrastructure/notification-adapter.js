export class NotificationAdapter {
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

    return new Promise((resolve, reject) => {
      this.#notification = new this.#notificationConstructor(title, options);
      this.#notification.addEventListener('show', () => {
        this.#isVisible = true;
        resolve();
      });
      this.#notification.addEventListener(
        'close',
        () => (this.#isVisible = false),
      );
      this.#notification.addEventListener('error', reject);
    });
  }

  async close() {
    if (this.#notification == null) {
      return;
    }

    return new Promise((resolve) => {
      this.#notification.addEventListener('close', resolve);
      this.#notification.close();
    });
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

  constructor() {
    super();
    setTimeout(() => this.dispatchEvent(new Event('show')));
  }

  close() {
    setTimeout(() => this.dispatchEvent(new Event('close')));
  }
}
