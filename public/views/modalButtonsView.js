import View from './View.js';

class ModalHeaderView extends View {
  _parentElement = document.querySelector('.modal-header');
  _errorMessage = `No modal window found :(`;
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return `
    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">${this._data.buttonText}</button>
    `
  }

}

export default new ModalHeaderView();
