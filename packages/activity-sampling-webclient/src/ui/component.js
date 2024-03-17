import { html, render } from 'lit-html';

export class Component extends HTMLElement {
  connectedCallback() {
    this.updateView();
  }

  updateView() {
    render(this.getView(), this.getRenderTarget());
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}
