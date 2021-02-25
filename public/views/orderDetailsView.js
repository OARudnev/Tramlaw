import View from './View.js';

class orderDetailsView extends View {
  _parentElement = document.querySelector('.col-md-9');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const rem = e.target.closest('.btn-outline-primary');
      if (!rem || rem.classList.contains('disabled') || !rem.classList.contains('remv')) return;
      handler(e.target.id);
    });
  }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    let btnRemove = true;
    if (this._orderStatus!=="New"|| !this._servicesRemovable) btnRemove = false;
    return `
    <tr>
      <th scope="row">${this._id + 1}</th>
      <td>${this._data.service_name}</td>
      <td>${this._data.qty}</td>
      <td>$${this._data.price}</td>
      <td><button type="button" id="${this._data.id}" class="btn btn-outline-primary${btnRemove ? "" : " disabled"} remv">Remove</button></td>
     </tr>
    `;
  }
}

export default new orderDetailsView();
