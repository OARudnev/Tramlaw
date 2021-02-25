export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered
   * @param {boolean} [render = true] If false, create a markup string instead of rendering to the DOM
   * @param {int} id ID of a service in an order
   * @param {string} orderStatus Status of a rendered order
   * @param {boolean} servicesRemovable If false, button 'Remove' is disabled
   * @param {boolean} changeMode If false, buttons 'Edit' and 'Remove' are disabled
   * @returns {undefined | string} A markup is returned if render=false
   * @this {Object} View instance
   * @author Oleg
   * @todo Finish implementation
   */
  render(data, render = true, options) {

    if (options) {
      if (options.id !== 'undefined') this._id = options.id;
      if (options.orderStatus !== 'undefined') this._orderStatus = options.orderStatus;
      if (options.servicesRemovable !== 'undefined') this._servicesRemovable = options.servicesRemovable;
      if (options.changeMode !== 'undefined') this._changeMode = options.changeMode;
    }

    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    this._render = render;
    const markup = this._generateMarkup();
    if (!this._render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // Updates changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }
      // Updates changed attributes
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
