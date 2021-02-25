import modalView from './views/modalView.js';

export const state = {
  cartItems: [],
};

// Query the database:
export const queryDB = async (data, action) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    const response = await fetch(action, options);
    return await response.json();
  } catch (err) {
    throw err
    }
};

// Render 'DB error message:
export const renderDBErrorMsg = (errorMsg, handler) => {
  modalView.render({
    modalHeader: 'Your changes have not been saved',
    modalBody: [errorMsg],
    modalButtons: ['Close'],
  });
  return handler.show();
}

// Render 'order status changed' message:
export const renderOrdStatusChanegedMsg = (orderStatus, handler) => {
  modalView.render({
    modalHeader: 'Order status changed',
    modalBody: [`Status of the order has been changed to '${orderStatus}' after you loaded this page.`],
    modalButtons: ['Close'],
  });
  return handler.show();
}

// Load initial values of a customer's credentials:
export const loadInitialValues = async () => {
  try {
  const credentials = Object.entries(await queryDB({}, '/getCredentials'));
  credentials.map((credential, i) => {
    let element = document.getElementById(`${credential[0]}`)
    if (element) element.value = credential[1] === 'NULL' ? '' : credential[1];
  });
  } catch (err) {
    throw err
    }
};
