import View from './View.js';

class orderDescriptionView extends View {
  _parentElement = document.querySelector('.col-md-9');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const rem = e.target.closest('.btn-outline-primary');
      if (!rem || rem.classList.contains('disabled') || !rem.classList.contains('change')) return;
      handler(e.target.parentNode.parentNode.querySelector('.form-control').value);
    });
  }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return `
    <label for="orderDescription">Short description of the problem:</label>
    <textarea class="form-control" name ="orderDescription" rows="4" ${this._changeMode ? "" : " disabled"}>${this._data}</textarea>
    <div class="col-12 mt-3">
    <button type="button" class="btn btn-outline-primary${this._orderStatus==="New" ? "" : " disabled"} change">${this._changeMode ? 'Save' : 'Edit'}</button>
    `
  }

}

export default new orderDescriptionView();
