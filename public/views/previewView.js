import View from './View.js';
import * as model from '../../model.js';

class PreviewView extends View {
  _parentElement = document.querySelector('.list-group');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const rem = e.target.closest('.remove');
      if (!rem) return;
      handler(model.state.cartItems, e.target.id);
    });
  }

  _generateMarkup() {
    return `
    <li class="list-group-item d-sm-flex justify-content-between lh-sm">
            <div>
              <h6 class="my-0">${this._data.service_name}</h6>
              <small id="${this._id}" class="remove">Remove</small>
            </div>
            <span class="text-muted">$${this._data.price}</span>
          </li>
    `;
  }
}

export default new PreviewView();
