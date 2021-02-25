import View from './View.js';
import modalButtonsView from './modalButtonsView.js';
import modalBodyView from './modalBodyView.js';

class ModalView extends View {
  _parentElement = document.querySelector('.modal-content');
  _errorMessage = `No modal window found :(`;
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return `
    <div class="modal-header">
          <h5 class="modal-title" id="modalWindowLabel">${this._data.modalHeader}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          ${this._data.modalBody.map((paragraph) => modalBodyView.render({bodyParagraph: paragraph}, false)).join('')}
        </div>
        <div class="modal-footer">
          ${this._data.modalButtons.map((button) => modalButtonsView.render({buttonText: button}, false)).join('')}
        </div>
    `
  }

}

export default new ModalView();
