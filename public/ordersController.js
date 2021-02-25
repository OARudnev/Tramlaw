import * as model from './model.js';
import ordersListView from './views/ordersListView.js';
import orderDetailsView from './views/orderDetailsView.js';
import orderDescriptionView from './views/orderDescriptionView.js';
import modalView from './views/modalView.js';
import orderView from './views/orderView.js';

'use strict'
let orderID;
const modalWindow = new bootstrap.Modal(document.getElementById('modalWindow'));
ordersListView.renderSpinner();

// Control orders:
const controlOrders = async function () {
  
  // Load list of orders:
  const result  = await model.queryDB(model.state.cartItems,'/getOrders');
  if (result.result === "error") {
    model.renderDBErrorMsg(result.msg, modalWindow);
  } else ordersListView.render(result);

  // Cancel an order:
  document.querySelector('.table').addEventListener('click', async function (e) {
    try {
      const rem = e.target.closest('.btn-outline-primary');
      if (!rem || rem.className.includes('disabled')) return;
      const result  = await model.queryDB({data: e.target.parentNode.parentNode.querySelector('.id').innerHTML}, '/cancelOrder');
      if (result.result === "error") {
        model.renderDBErrorMsg(result.msg, modalWindow);
      } else
      ordersListView.render(await model.queryDB(model.state.cartItems,'/getOrders'));
    } catch (error) {
      model.renderDBErrorMsg(error, modalWindow);
    }
  });
    
  // Get order details:
  document.querySelector('.table').addEventListener('click', async function (e) {
    try {
      const rem = e.target.closest('.ordersRow');
      if (!rem) return
      ordersListView.renderSpinner();
      orderID = e.target.parentNode.querySelector('.id').innerHTML;
      const result = await model.queryDB({orderID: orderID},'/getOrderDetails');
      if (result.result === "error") {
        model.renderDBErrorMsg(result.msg, modalWindow);
      } else {
      orderView.render(result);
      orderDescriptionView.addHandlerClick(controlOrderDescription);
      orderDetailsView.addHandlerClick(controlOrderDetails);
      }
    } catch (error) {
      model.renderDBErrorMsg(error, modalWindow);
    }
  });

};

// Control order details:
const controlOrderDetails = async function (serviceID) {
  try {
    // Remove service:
    const resultRemoveService = await model.queryDB({orderID: orderID, serviceID: serviceID}, '/removeService');
    if (resultRemoveService.result === "statusChanged") {
      model.renderOrdStatusChanegedMsg(resultRemoveService.msg, modalWindow);
    } else if (resultRemoveService.result === "error") {
      model.renderDBErrorMsg(resultRemoveService.msg, modalWindow);
    }
    // Render order details:
    const resultGetOrderDetails = await model.queryDB({orderID: orderID},'/getOrderDetails');
    if (resultGetOrderDetails === "error") {
      model.renderDBErrorMsg(resultGetOrderDetails.msg, modalWindow);
    } else {
      orderView.render(resultGetOrderDetails);
    }
  } catch (error) {
    model.renderDBErrorMsg(error, modalWindow);
  }
}

// Control order description:
const controlOrderDescription = async function (description) {

  // If description is more than 300 characters:
  if (description.length > 300) {
    modalView.render({
      modalHeader: 'Your changes have not been saved',
      modalBody: [`Short description of the problem must not exceed 300 characters.`],
      modalButtons: ['Close'],
    });
    return modalWindow.show();
  }

  document.getElementsByClassName('form-control')[0].toggleAttribute('disabled');

  let btnChangeText = document.getElementsByClassName('btn-outline-primary change')[0].innerHTML;
  if (btnChangeText === 'Edit') document.getElementsByClassName('btn-outline-primary change')[0].innerHTML = 'Save';
  if (btnChangeText === 'Save') {
    try {
      // If the order description was not changed:
      if (document.getElementsByClassName('form-control')[0].innerHTML === description) return document.getElementsByClassName('btn-outline-primary change')[0].innerHTML = 'Edit';
      
      // setOrderDescription checks if the order status in the DB is 'NEW'. TRUE: it updates the DB and returns 'OK', FALSE: it returns current status of the order: 
      const result = await model.queryDB({orderID: orderID, description: description}, '/setOrderDescription');

      // If the order status was changed while making alterations to the order description:
      if (result.result === "statusChanged") {
        orderView.render(await model.queryDB({orderID: orderID},'/getOrderDetails'));
        model.renderOrdStatusChanegedMsg(result.msg, modalWindow);
      }
      else if (result.result === "error") {
        orderView.render(await model.queryDB({orderID: orderID},'/getOrderDetails'));
        model.renderDBErrorMsg(result.msg);
      } else {
      document.getElementsByClassName('form-control')[0].innerHTML = description;
      document.getElementsByClassName('btn-outline-primary change')[0].innerHTML = 'Edit';
      }
    } catch (error) {
      model.renderDBErrorMsg(error, modalWindow);
    }
  }
}

ordersListView.addHandlerRender(controlOrders);