import { html } from 'lit-html';

import { Component } from '@activity-sampling/utils/src/components.js';

import './main-menu.css';

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
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false" @click=${{ handleEvent: (e) => this.#onMenuItemClick(e), capture: true }} @pointerover=${(e) => this.#onMenuItemPointerOver(e)}>Notifications</a>
            <ul role="menu">
              <li>
                <a role="menuitem" aria-haspopup="menu" aria-expanded="false" @click=${{ handleEvent: (e) => this.#onMenuItemClick(e), capture: true }} @pointerover=${(e) => this.#onMenuItemPointerOver(e)}>Start</a>
                <ul role="menu">
                  <li><a role="menuitem" href="#5-min">5 min</a></li>
                  <li><a role="menuitem" href="#10-min">10 min</a></li>
                  <li><a role="menuitem" href="#15-min">15 min</a></li>
                  <li><a role="menuitem" href="#20-min">20 min</a></li>
                  <li><a role="menuitem" href="#30-min">30 min</a></li>
                  <li><a role="menuitem" href="#60-min">60 min</a></li>
                  <li><a role="menuitem" href="#1-min">1 min</a></li>
                </ul>
              </li>
              <li><a role="menuitem" href="#stop">Stop</a></li>
            </ul>
          </li>
          <li>
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false" @click=${{ handleEvent: (e) => this.#onMenuItemClick(e), capture: true }} @pointerover=${(e) => this.#onMenuItemPointerOver(e)}>Report</a>
            <ul role="menu">
              <li><a role="menuitem" href="#time">Time</a></li>
              <li><a role="menuitem" href="#timesheet">Timesheet</a></li>
            </ul>
          </li>
          <li></li>
          <li>
            <a role="menuitem" aria-haspopup="menu" aria-expanded="false" @click=${{ handleEvent: (e) => this.#onMenuItemClick(e), capture: true }} @pointerover=${(e) => this.#onMenuItemPointerOver(e)}>View</a>
            <ul role="menu">
              <li><a role="menuitem" href="#refresh"">Refresh</a></li>
            </ul>
          </li>
          <li></li>
        </ul>
      </nav>
    `;
  }

  #onBackgroundClick = (event) => {
    console.log('onBackgroundClick', event);
    if (!this.contains(event.target)) {
      this.#closeAllPopup();
    }
  };

  #onMenuItemClick(/** @type {PointerEvent} */ event) {
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

  #onMenuItemPointerOver(event) {
    console.log('onMenuItemPointerOver', event);
    const target = event.currentTarget;
    if (this.#isAnyPopupOpen()) {
      this.#closeAllPopup(target);
      if (this.#hasPopup(target)) {
        this.#openPopup(target);
      }
    }
  }

  #hasPopup(menuiItem) {
    return menuiItem.getAttribute('aria-haspopup') === 'menu';
  }

  #isOpen(menuItem) {
    return menuItem.getAttribute('aria-expanded') === 'true';
  }

  #isAnyPopupOpen() {
    return this.querySelector('[aria-expanded="true"]');
  }

  #openPopup(menuiItem) {
    const popupMenu = menuiItem.nextElementSibling;
    if (popupMenu) {
      popupMenu.style.display = 'block';
      menuiItem.setAttribute('aria-expanded', 'true');
    }
  }

  #closePopup(menuItem) {
    if (this.#isOpen(menuItem)) {
      menuItem.setAttribute('aria-expanded', 'false');
      menuItem.nextElementSibling.style.display = 'none';
      console.log('closed', menuItem);
    }
  }

  #closeAllPopup(menuItem) {
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

  #doesNotContain(popup, menuItem) {
    console.log('doesNotContain', popup, menuItem);
    if (menuItem) {
      return !popup.nextElementSibling.contains(menuItem);
    }

    return true;
  }
}

window.customElements.define('m-main-menu', MainMenuComponent);
