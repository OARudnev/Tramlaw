import * as model from './model.js';
import ordersListView from './views/ordersListView.js';
import orderDetailsView from './views/orderDetailsView.js';
import modalView from './views/modalView.js';
import orderView from './views/orderView.js';

'use strict'
let orderID;
let status = 'New';
const modalWindow = new bootstrap.Modal(document.getElementById('modalWindow'));

// Change order status:
  document.getElementById('dl1').addEventListener('click', function (e) {
    status = e.target.options[e.target.selectedIndex].text
  })
 

  document.querySelector('.btn-primary').addEventListener('click', async function (e) {
    try {
      e.preventDefault();
      const response = await model.queryDB({orderID: document.querySelector('.form-control').value, status: status}, '/changeOrderStatus');
      if (response.result !== 'OK') {
        modalView.render({
          modalHeader: 'Your changes have not been saved',
          modalBody: ['Failed to change status'],
          modalButtons: ['Close'],
        });
          return modalWindow.show();
      }
      ordersListView.render(await model.queryDB(model.state.cartItems,'/getAllOrders'));
    } catch (error) {
      model.renderDBErrorMsg(error.msg, modalWindow);
    }
  });

// Control orders:
const controlOrders = async function () {
  try {
    // Load list of orders:
    const response = await model.queryDB(model.state.cartItems,'/getAllOrders');
    if (response.result === 'error') model.renderDBErrorMsg(response.msg, modalWindow);
    else ordersListView.render(response);

    // Cancel an order:
    document.querySelector('.table').addEventListener('click', async function (e) {
      const rem = e.target.closest('.btn-outline-primary');
      if (!rem || rem.className.includes('disabled')) return;
      await model.queryDB({data: e.target.parentNode.parentNode.querySelector('.id').innerHTML}, '/cancelOrder');
      ordersListView.render(await model.queryDB(model.state.cartItems,'/getOrders'));
    });
      

    document.querySelector('.table').addEventListener('click', async function (e) {
      const rem = e.target.closest('.ordersRow');
      if (!rem) return
      orderID = e.target.parentNode.querySelector('.id').innerHTML;
      orderView.render(await model.queryDB({orderID: orderID},'/getOrderDetails'));
      orderDetailsView.addHandlerClick(controlOrderDetails);
    });
  } catch (error) {
    model.renderDBErrorMsg(error.msg, modalWindow);
  }
};

// Control order details:
const controlOrderDetails = async function (serviceID) {
  try {
    const result = await model.queryDB({orderID: orderID, serviceID: serviceID}, '/removeService');
    orderView.render(await model.queryDB({orderID: orderID},'/getOrderDetails'));
    if (result.result !== "OK") {
      model.renderOrdStatusChanegedMsg(result.result);
    }
  } catch (error) {
    model.renderDBErrorMsg(error.msg, modalWindow);
  }
}

ordersListView.addHandlerRender(controlOrders);