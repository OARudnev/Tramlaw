import View from './View.js';

class ModalBodyView extends View {
  _parentElement = document.querySelector('.modal-header');
  _errorMessage = `No modal window found :(`;
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return `
    <p>${this._data.bodyParagraph}</p>
    `
  }

}

export default new ModalBodyView();
