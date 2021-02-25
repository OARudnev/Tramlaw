import View from './View.js';
import * as model from '../../model.js';

class OrdersView extends View {
  _parentElement = document.querySelector('.list-group');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const rem = e.target.closest('.remove');
      if (!rem || rem.classList.contains('disabled')) return;
      handler(model.state.cartItems, e.target.id);
    });
  }

  _generateMarkup() {
    const orderDate = new Date(this._data.timePlaced);
    return `
    <tr>
      <th class="ordersRow id" scope="row">${this._data.id}</th>
      <td class="ordersRow">${new Intl.DateTimeFormat(navigator.language).format(orderDate)}</td>
      <td class="ordersRow">${this._data.serv_order}</td>
      <td class="ordersRow">${this._data.orderPrice}</td>
      <td>${this._data.status}</td>
      <td><button type="button" class="btn btn-outline-primary${this._data.status==="Completed" || this._data.status==="Cancelled" ? " disabled" : ""}">Cancel</button></td>
    </tr>
    `;
  }
}

export default new OrdersView();
