import ordersView from './ordersView.js';
import View from './View.js';

class ordersListView extends View {
  _parentElement = document.querySelector('table');
  _errorMessage = `You haven't placed any orders yet :(`;
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    
    const tableHeader = `
    
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Placed on</th>
        <th scope="col">Order quantity</th>
        <th scope="col">Total price</th>
        <th scope="col">Status</th>
        <th scope="col"></th>
      </tr>
    </thead>
    <tbody>
`;
    const tableFooter = `
      </tbody>
    `;
    return tableHeader.concat(this._data.map((order, i) => ordersView.render(order, false, {id: i})).join('')).concat(tableFooter);
  }

}

export default new ordersListView();
