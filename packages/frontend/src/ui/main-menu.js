import { html } from 'lit-html';

import { Component } from '@activity-sampling/utils/src/browser';

import { Services } from '../application/services.js';
import { Duration } from '@activity-sampling/utils';

class MainMenuComponent extends Component {
  // TODO replace <a> with <button>

  connectedCallback() {
    super.connectedCallback();
    this.querySelectorAll('[role="menuitem"]').forEach((menuItem) => {
      menuItem.addEventListener('click', this.#onMenuItemClick, {
        capture: true,
      });
      menuItem.addEventListener('pointerover', this.#onMenuItemPointerOver);
    });
    window.addEventListener('pointerdown', this.#onBackgroundClick, {
      capture: true,
    });
  }

  disconnectedCallback() {
    window.removeEventListener('pointerdown', this.#onBackgroundClick, {
      capture: true,
    });
  }

  getView() {
    return html`
      <nav>
        <ul role="menubar" class="h-stack gap-50">
          <li>
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false"
              >Notifications</a
            >
            <ul role="menu">
              <li>
                <a role="menuitem" aria-haspopup="menu" aria-expanded="false"
                  >Start <span class="material-icons">chevron_right</span></a
                >
                <ul role="menu">
                  <li>
                    <a
                      role="menuitem"
                      href="#5-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 5),
                        capture: true,
                      }}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >5 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#10-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 10),
                        capture: true,
                      }}
                      >10 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#15-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 15),
                        capture: true,
                      }}
                      >15 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#20-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 20),
                        capture: true,
                      }}
                      >20 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#30-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 30),
                        capture: true,
                      }}
                      >30 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#60-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 60),
                        capture: true,
                      }}
                      >60 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#1-min"
                      @click=${{
                        handleEvent: (e) => this.#startCoundown(e, 1),
                        capture: true,
                      }}
                      >1 min</a
                    >
                  </li>
                </ul>
              </li>
              <li>
                <a
                  role="menuitem"
                  href="#stop"
                  @click=${{
                    handleEvent: (e) => this.#stopCoundown(e),
                    capture: true,
                  }}
                  >Stop</a
                >
              </li>
            </ul>
          </li>
          <li>
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false"
              >Report</a
            >
            <ul role="menu">
              <li><a role="menuitem" href="#time">Time</a></li>
              <li><a role="menuitem" href="#timesheet">Timesheet</a></li>
            </ul>
          </li>
          <li>
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false"
              >View</a
            >
            <ul role="menu">
              <li>
                <a
                  role="menuitem"
                  href="#refresh"
                  @click=${{
                    handleEvent: (e) => this.#refresh(e),
                    capture: true,
                  }}
                  >Refresh</a
                >
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    `;
  }

  async #startCoundown(
    /** @type {Event} */ event,
    /** @type {number} */ minutes,
  ) {
    await Services.get().askPeriodically({
      period: new Duration(`PT${minutes}M`),
    });
    event.stopPropagation();
    event.preventDefault();
  }

  async #stopCoundown(/** @type {Event} */ event) {
    await Services.get().stopAskingPeriodically();
    event.stopPropagation();
    event.preventDefault();
  }

  async #refresh(/** @type {Event} */ event) {
    Services.get().selectRecentActivities();
    event.stopPropagation();
    event.preventDefault();
  }

  #onBackgroundClick = (/** @type {Event} */ event) => {
    if (!this.querySelector('[role="menubar"]').contains(event.target)) {
      this.#closeAllPopup();
    }
  };

  #onMenuItemClick = (/** @type {Event} */ event) => {
    const target = event.currentTarget;
    if (this.#hasPopup(target)) {
      if (this.#isOpen(target)) {
        this.#closePopup(target);
      } else {
        this.#closeAllPopup(target);
        this.#openPopup(target);
      }
    } else {
      this.#closeAllPopup();
    }
    event.stopPropagation();
    event.preventDefault();
  };

  #onMenuItemPointerOver = (/** @type {Event} */ event) => {
    const target = event.currentTarget;
    if (this.#isAnyPopupOpen()) {
      this.#closeAllPopup(target);
      if (this.#hasPopup(target)) {
        this.#openPopup(target);
      }
    }
  };

  #hasPopup(/** @type {HTMLElement} */ menuItem) {
    return menuItem.getAttribute('aria-haspopup') === 'menu';
  }

  #isOpen(/** @type {HTMLElement} */ menuItem) {
    return menuItem.getAttribute('aria-expanded') === 'true';
  }

  #isAnyPopupOpen() {
    return this.querySelector('[aria-expanded="true"]');
  }

  #openPopup(/** @type {HTMLElement} */ menuItem) {
    const popupMenu = menuItem.nextElementSibling;
    if (popupMenu) {
      const rect = menuItem.parentElement.getBoundingClientRect();
      if (this.#isPopup(menuItem)) {
        popupMenu.style.top = rect.height + 'px';
        popupMenu.style.left = 0;
      } else {
        popupMenu.style.top = '-1px';
        popupMenu.style.left = rect.width + 'px';
      }

      menuItem.setAttribute('aria-expanded', 'true');
    }
  }

  #isPopup(/** @type {HTMLElement} */ menuItem) {
    return !this.querySelector('[role="menubar"] > * > [role="menu"]').contains(
      menuItem,
    );
  }

  #closePopup(/** @type {HTMLElement} */ menuItem) {
    if (this.#isOpen(menuItem)) {
      menuItem.setAttribute('aria-expanded', 'false');
    }
  }

  #closeAllPopup(/** @type {HTMLElement} */ menuItem) {
    if (!(menuItem instanceof Node)) {
      menuItem = false;
    }
    this.querySelectorAll('[aria-haspopup="menu"]').forEach((popup) => {
      if (this.#doesNotContain(popup, menuItem)) {
        this.#closePopup(popup);
      }
    });
  }

  #doesNotContain(
    /** @type {HTMLElement} */ popup,
    /** @type {HTMLElement} */ menuItem,
  ) {
    if (menuItem) {
      return !popup.nextElementSibling.contains(menuItem);
    }

    return true;
  }
}

window.customElements.define('m-main-menu', MainMenuComponent);
