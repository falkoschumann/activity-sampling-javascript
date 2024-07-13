import { html } from 'lit-html';

import { Component } from '@activity-sampling/utils/src/components.js';

import './main-menu.css';
import { Services } from '../application/services.js';
import { Duration } from '@activity-sampling/utils';

class MainMenuComponent extends Component {
  // TODO replace <a> with <button>

  connectedCallback() {
    super.connectedCallback();
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
            <a
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded="false"
              @click=${{
                handleEvent: (e) => this.#onMenuItemClick(e),
                capture: true,
              }}
              @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
              >Notifications</a
            >
            <ul role="menu">
              <li>
                <a
                  role="menuitem"
                  aria-haspopup="menu"
                  aria-expanded="false"
                  @click=${{
                    handleEvent: (e) => this.#onMenuItemClick(e),
                    capture: true,
                  }}
                  @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                  >Start</a
                >
                <ul role="menu">
                  <li>
                    <a
                      role="menuitem"
                      href="#5-min"
                      @click=${() => this.#startCoundown(5)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >5 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#10-min"
                      @click=${() => this.#startCoundown(10)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >10 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#15-min"
                      @click=${() => this.#startCoundown(15)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >15 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#20-min"
                      @click=${() => this.#startCoundown(20)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >20 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#30-min"
                      @click=${() => this.#startCoundown(30)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >30 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#60-min"
                      @click=${() => this.#startCoundown(60)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >60 min</a
                    >
                  </li>
                  <li>
                    <a
                      role="menuitem"
                      href="#1-min"
                      @click=${() => this.#startCoundown(1)}
                      @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                      >1 min</a
                    >
                  </li>
                </ul>
              </li>
              <li>
                <a
                  role="menuitem"
                  href="#stop"
                  @click=${() => this.#stopCoundown()}
                  @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                  >Stop</a
                >
              </li>
            </ul>
          </li>
          <li>
            <a
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded="false"
              @click=${{
                handleEvent: (e) => this.#onMenuItemClick(e),
                capture: true,
              }}
              @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
              >Report</a
            >
            <ul role="menu">
              <li><a role="menuitem" href="#time">Time</a></li>
              <li><a role="menuitem" href="#timesheet">Timesheet</a></li>
            </ul>
          </li>
          <li></li>
          <li>
            <a
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded="false"
              @click=${{
                handleEvent: (e) => this.#onMenuItemClick(e),
                capture: true,
              }}
              @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
              >View</a
            >
            <ul role="menu">
              <li>
                <a
                  role="menuitem"
                  href="#refresh"
                  @click=${() => this.#refresh()}
                  @pointerover=${(e) => this.#onMenuItemPointerOver(e)}
                  >Refresh</a
                >
              </li>
            </ul>
          </li>
          <li></li>
        </ul>
      </nav>
    `;
  }

  async #startCoundown(/** @type {number} */ minutes) {
    // TODO call onMenuItemClick in all handlers
    this.#closeAllPopup();
    await Services.get().askPeriodically({
      period: new Duration(`PT${minutes}M`),
    });
  }

  async #stopCoundown() {
    this.#closeAllPopup();
    await Services.get().stopAskingPeriodically();
  }

  async #refresh() {
    this.#closeAllPopup();
    Services.get().selectRecentActivities();
  }

  #onBackgroundClick = (/** @type {Event} */ event) => {
    console.log('onBackgroundClick', event);
    if (!this.querySelector('[role="menubar"]').contains(event.target)) {
      this.#closeAllPopup();
    }
  };

  #onMenuItemClick(/** @type {Event} */ event) {
    console.log('handlePopup', event);
    const target = event.currentTarget;
    if (this.#hasPopup(target)) {
      console.log('has popup');
      if (this.#isOpen(target)) {
        console.log('is open');
        this.#closePopup(target);
      } else {
        console.log('is not open');
        this.#closeAllPopup(target);
        this.#openPopup(target);
      }
    } else {
      this.#closeAllPopup();
    }
    event.stopPropagation();
    event.preventDefault();
  }

  #onMenuItemPointerOver(/** @type {Event} */ event) {
    console.log('onMenuItemPointerOver', event);
    const target = event.currentTarget;
    if (this.#isAnyPopupOpen()) {
      this.#closeAllPopup(target);
      if (this.#hasPopup(target)) {
        this.#openPopup(target);
      }
    }
  }

  #hasPopup(/** @type {HTMLElement} */ menuiItem) {
    return menuiItem.getAttribute('aria-haspopup') === 'menu';
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
      const rect = menuItem.getBoundingClientRect();
      if (this.#isPopup(menuItem)) {
        popupMenu.style.top = rect.height + 'px';
        popupMenu.style.left = 0;
      } else {
        popupMenu.style.top = 0;
        popupMenu.style.left = rect.width + 'px';
      }

      popupMenu.style.display = 'block';
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
      menuItem.nextElementSibling.style.display = 'none';
      console.log('closed', menuItem);
    }
  }

  #closeAllPopup(/** @type {HTMLElement} */ menuItem) {
    console.log('closing all', menuItem);
    if (!(menuItem instanceof Node)) {
      menuItem = false;
    }
    this.querySelectorAll('[aria-haspopup="menu"]').forEach((popup) => {
      if (this.#doesNotContain(popup, menuItem)) {
        console.log('closing', popup);
        this.#closePopup(popup);
      }
    });
  }

  #doesNotContain(
    /** @type {HTMLElement} */ popup,
    /** @type {HTMLElement} */ menuItem,
  ) {
    console.log('doesNotContain', popup, menuItem);
    if (menuItem) {
      return !popup.nextElementSibling.contains(menuItem);
    }

    return true;
  }
}

window.customElements.define('m-main-menu', MainMenuComponent);
