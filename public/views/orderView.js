import View from './View.js';
import orderDetailsView from './orderDetailsView.js';
import orderDescriptionView from './orderDescriptionView.js';

class orderView extends View {
  _parentElement = document.querySelector('.col-md-9');
  _errorMessage = `You haven't ordered yet :(`;
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    const orderDate = new Date(this._data.timePlaced);
    const sevicesRemovable = this._data.servicesInOrders.length > 1 ? true : false;
    return `
    <div class="justify-content-center align-items-center pt-2 pb-1 mb-2 border-bottom">
      <h2>Order ${this._data.id}</h2>
    </div>
      <p>You can edit an order only if its status is <strong>'New'</strong></p>
      <div class="bd-example">
        <div class="accordion pb-3" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <strong>Order info</strong>
              </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
              <div class="accordion-body row g-3">
                <div class="col">
                  <p><strong>Status:</strong></p>
                  <p>${this._data.status}</p>
                </div>
                <div class="col">
                  <p><strong>Created on:</strong></p>
                  <p>${new Intl.DateTimeFormat(navigator.language).format(orderDate)}</p>
                </div>
                <div class="col">
                  <p><strong>Total price:</strong></p>
                  <p>$${this._data.orderPrice}</p>
                </div>
                <div class="col">
                  <p><strong>Order quantity:</strong></p>
                  <p>${this._data.serv_order}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                <strong>Customer info</strong>
              </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
              <div class="accordion-body row g-3">
                <div class="col">
                  <p><strong>Name:</strong></p>
                  <p>${this._data.firstName} ${this._data.lastName}</p>
                </div>
                <div class="col">
                  <p><strong>Phone:</strong></p>
                  <p>${this._data.phone}</p>
                  </div>
                <div class="col">
                  <p><strong>email:</strong></p>
                  <p>${this._data.email}</p>
                </div>
                <div class="col">
                  <p><strong>Address:</strong></p>
                  <p>${this._data.address}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <strong>Services</strong>
              </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
              <div class="accordion-body">
                <table class="table table-borderless table-responsive-sm" id="QWERTY">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Services</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Price</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._data.servicesInOrders.map((service, i) => orderDetailsView.render(service, false, {id: i, orderStatus: this._data.status, servicesRemovable: sevicesRemovable})).join('')}
                  </tbody>
                </table>
                ${orderDescriptionView.render(this._data.description ? this._data.description : "Description was not provided" , false, {orderStatus: this._data.status, changeMode: false})}
              </div>
            </div>       
          </div>
        </div>
      </div>
    </div>`;
  }

}

export default new orderView();
