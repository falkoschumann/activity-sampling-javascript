import { Duration } from 'activity-sampling-shared';

// TODO create event types
// TODO clean up naming

/**
 * @fires Notifier#notification-scheduled
 * @fires Notifier#countdown
 * @fires Notifier#notification-presented
 * @fires Notifier#notification-acknowledged
 */
export class Notifier extends EventTarget {
  /** @type {Duration} */ #interval;
  /** @type {Duration} */ #countdown;
  /** @type {string} */ currentActvity = 'Show Blue Horizon on YouTube ';
  /** @type {Notification} */ #notification;
  #notifierId;
  #progressId;

  start(deliverIn = new Duration('PT30M')) {
    this.stop();
    Notification.requestPermission().then((result) => {
      console.log('Notification permission:', result);
    });

    this.#interval = new Duration(deliverIn);
    this.#notifierId = setInterval(() => this.#notifyElapsed(), deliverIn);
    this.dispatchEvent(
      new CustomEvent('notification-scheduled', {
        detail: new Duration(deliverIn),
      }),
    );

    this.#countdown = new Duration(deliverIn);
    this.#progressId = setInterval(() => this.#progressElapsed(), 1000);
  }

  stop() {
    clearInterval(this.#notifierId);
    clearInterval(this.#progressId);
  }

  #notifyElapsed() {
    console.log('Notification permission:', Notification.permission);
    console.log('notify elapsed');

    if (this.#notification) {
      this.#notification.close();
    }

    this.#notification = new Notification('What are you working on?', {
      icon: './favicon-32x32.png',
      body: `${this.currentActvity} Click for same activity as before.\nOr open window to change it.`,
    });
    this.#notification.onshow = () => {
      this.dispatchEvent(new CustomEvent('notification-presented'));
    };
    this.#notification.onclick = () => {
      this.dispatchEvent(
        new CustomEvent('notification-acknowledged', {
          detail: this.currentActvity,
        }),
      );
      this.#notification.close();
    };

    this.#countdown = new Duration(this.#interval);
    this.dispatchEvent(
      new CustomEvent('notification-scheduled', {
        detail: new Duration(this.#interval),
      }),
    );
  }

  #progressElapsed() {
    this.#countdown.subtract(1000);
    console.log('progress elapsed', this.#countdown);

    this.dispatchEvent(
      new CustomEvent('countdown', { detail: new Duration(this.#countdown) }),
    );
  }
}
