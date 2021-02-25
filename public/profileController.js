import * as model from './model.js'
import modalView from './views/modalView.js';

'use strict'
const modalWindow = new bootstrap.Modal(document.getElementById('modalWindow'));
let inputFields = document.querySelectorAll('input[type="text"]');

const toggleInputFields = () => {
  Object.values(inputFields).map(inputField => {
    if (inputField.id !== 'username') inputField.toggleAttribute('disabled')
  });
}

try {
  model.loadInitialValues();
} catch (error) {
  model.renderDBErrorMsg(error.msg, modalWindow);
}

// Update credentials:
document.getElementById('b1').addEventListener('click', async function (e) {
  try {
    e.preventDefault();
    let btnChangeText = document.getElementById('b1').innerHTML;
    if (btnChangeText === 'Edit') {
      document.getElementById('b1').innerHTML = 'Save';

      // Activate fields:
      toggleInputFields();
    }
    if (btnChangeText === 'Save') {

      //document.getElementById('FormCredentials').submit(); <- using the server

      // Get updated credentials from the form:
      let updatedCredentials = new FormData();
      Object.values(inputFields).map(inputField => updatedCredentials.append(inputField.id, inputField.value));

      // Send updated credentials to the server:
      const response = await model.queryDB(Object.fromEntries(updatedCredentials.entries()), '/updateCredentials');
      if (response.result === 'OK') {
        document.getElementById('b1').innerHTML = 'Edit';

        // Deactivate fields:
        toggleInputFields();
        return; 
      }

      // In case of errors generates a modal window with error messages:
      modalView.render({
        modalHeader: 'Your changes have not been saved',
        modalBody: response.map((error)=> error.msg),
        modalButtons: ['Cancel'],
      });
        modalWindow.show();
    }
  } catch (error) {
    model.renderDBErrorMsg(error, modalWindow);
  }
});
    
// Change password:
document.getElementById('b2').addEventListener('click', async function (e) {
  try {
    e.preventDefault();

    // Get password from the form:
    let newPassword = new FormData();
      
    newPassword.append(document.getElementById(`password`).name, document.getElementById(`password`).value);
    newPassword.append(document.getElementById(`passwordMatch`).name, document.getElementById(`passwordMatch`).value);
    
    // Send new password to the server:
    const response = await model.queryDB(Object.fromEntries(newPassword.entries()), '/changePassword');
    if (response.result === 'OK') {
      modalView.render({
        modalHeader: 'Changes have been saved',
        modalBody: ['Your password has been changed.'],
        modalButtons: ['Close'],
      });
        return modalWindow.show();
    }
    // In case of errors generates a modal window with error messages:
    modalView.render({
      modalHeader: 'Your changes have not been saved',
      modalBody: JSON.parse(response).map((error)=> error.msg),
      modalButtons: ['Close'],
    });
      modalWindow.show();
  } catch (error) {
    model.renderDBErrorMsg(error, modalWindow);
  }
});