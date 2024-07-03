import { Duration } from '@activity-sampling/utils';

// TODO Convert notifier into servie worker?

/**
 * @fires Notifier#notification-scheduled
 * @fires Notifier#countdown-progressed
 * @fires Notifier#notification-presented
 * @fires Notifier#notification-acknowledged
 */
export class Notifier extends EventTarget {
  /** @type {Duration} */ #interval;
  /** @type {Duration} */ #countdown;
  currentActivity = '';
  /** @type {Notification} */ #notification;
  #notifierId;
  #progressId;

  start(deliverIn = new Duration('PT30M')) {
    this.stop();

    Notification.requestPermission();
    this.#interval = new Duration(deliverIn);
    this.#notifierId = setInterval(() => this.#notifierElapsed(), deliverIn);
    this.dispatchEvent(
      new NotificationScheduledEvent(new Duration(this.#interval)),
    );

    this.#countdown = new Duration(deliverIn);
    this.#progressId = setInterval(() => this.#progressElapsed(), 1000);
  }

  stop() {
    clearInterval(this.#notifierId);
    clearInterval(this.#progressId);
  }

  #notifierElapsed() {
    if (this.#notification) {
      this.#notification.close();
    }

    this.#notification = new Notification('What are you working on?', {
      body:
        this.currentActivity +
        '\nClick for same activity as before or open window to change it.',
      requireInteraction: true,
    });
    this.#notification.onshow = () => {
      this.dispatchEvent(new NotificationPresentedEvent());
    };
    this.#notification.onclick = () => {
      this.dispatchEvent(
        new NotificationAcknowledgedEvent(this.currentActivity),
      );
      this.#notification.close();
    };

    this.#countdown = new Duration(this.#interval);
    this.dispatchEvent(
      new NotificationScheduledEvent(new Duration(this.#interval)),
    );
  }

  #progressElapsed() {
    this.#countdown.subtract(1000);
    this.dispatchEvent(
      new CountdownProgressedEvent(new Duration(this.#countdown)),
    );
  }
}

export const NOTIFICATION_SCHEDULED_EVENT = 'notification-scheduled';

export class NotificationScheduledEvent extends Event {
  #deliverIn;

  constructor(deliverIn) {
    super(NOTIFICATION_SCHEDULED_EVENT);
    this.#deliverIn = deliverIn;
  }

  get deliverIn() {
    return this.#deliverIn;
  }
}

export const NOTIFICATION_PRESENTED_EVENT = 'notification-presented';

export class NotificationPresentedEvent extends Event {
  constructor() {
    super(NOTIFICATION_PRESENTED_EVENT);
  }
}

export const NOTIFICATION_ACKNOWLEDGED_EVENT = 'notification-acknowledged';

export class NotificationAcknowledgedEvent extends Event {
  #activity;

  constructor(activity) {
    super(NOTIFICATION_ACKNOWLEDGED_EVENT);
    this.#activity = activity;
  }

  get activity() {
    return this.#activity;
  }
}

export const COUNTDOWN_PROGRESSD_EVENT = 'countdown-progressed';

export class CountdownProgressedEvent extends Event {
  #remaining;

  constructor(remaining) {
    super(COUNTDOWN_PROGRESSD_EVENT);
    this.#remaining = remaining;
  }

  get remaining() {
    return this.#remaining;
  }
}
