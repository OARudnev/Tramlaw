var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { response } = require('express');
const Cart = require('../models/cart.js');
const { session } = require('passport');
const saltRounds = 10;
const DBErrorMsg = {result: "error", msg:"There was an error processing your request. “Please refresh the page and try again."};

const nodemailer = require('nodemailer');
      let transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
           user: '',
           pass: ''
        }
    });

/* GET home page. */
router.get('/', async function(req, res) {

  const selectItemInService = function (item) {
    return new Promise ((resolve, reject )=>{
      const db = require('../db.js');
        db.query(`SELECT item FROM itemsInServices WHERE service_id=${item}`, function(error, results, fields){
          if (error) throw error;
          resolve(results.map((res)=>res.item));
          });
        });
    };
    
    const selectAllItemsInService = async function (data) {
      return Promise.all(
      data.map(async function (item) {
        return { ...item, serviceInServices: await selectItemInService(item.id)};
      }));
    
    }
  
  const getServices = async () => {
    return new Promise ((resolve, reject )=>{
      const db = require('../db.js');
      db.query(`SELECT id, service_name, price, uom FROM services`, async function(error, results, fields){
        if (error) throw error;
        resolve(await selectAllItemsInService(results));
      });
    });
  }
  let services = await getServices();
  /////
  res.render('home', { title: 'Tramlaw', script: 'home.js', services, homepage: true} );
});

router.get('/orders', authenticationMiddleware(), function(req, res){
  res.render('orders', { title: 'Orders', script: 'ordersController.js', active: {orders: true }});
});

router.get('/cart', authenticationMiddleware(), function(req, res){

  if (!req.session.cart) {
    return res.render('cart', {title: 'Your shopping cart', script: 'cart.js', services: null});}
  const cart = new Cart(req.session.cart);
  res.render('cart', {title: 'Your shopping cart', script: 'cart.js', services: cart.generateArray(), totalPrice: cart.totalPrice, active: {cart: true }});
});

router.get('/login', function(req, res){
  res.render('login', { title: 'Log in to myTramlaw', notLoggedIn: true });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/orders',
  failureRedirect: '/login'}));

  router.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });


  const registerUser = function (username, email, password) {
    return new Promise ((resolve, reject)=>{
      const db = require('../db.js');

      bcrypt.hash(password, saltRounds, function(err, hash) {
        db.query('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username, email, hash], function(error, results, fields){
          if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              if (error.sqlMessage.includes('username')) return resolve([{msg: "Пользователь с таким именем уже зарегистрирован."}]);
              if (error.sqlMessage.includes('email')) return resolve([{msg: "Пользователь с таким email уже зарегистрирован."}]);
            }
              else throw error;
          }
          resolve({result: "OK"});
        });
      });
    });
  }


router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Registration', notLoggedIn: true });
});

// What happens after pressing 'Submit' button on the registration page:
router.post('/register', async function(req, res, next) {
  // Add a user to a database:

  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('username', 'Username must be between 1-15 characters long.').len(1, 15);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
  req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
  req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
  
  const errors = req.validationErrors();

  if (errors) {

    res.render('register', {
      title: 'Registration Error',
      errors: errors
    });
  } else {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;
      const db = require('../db.js');

      const result = await registerUser(username, email, password);

      if (result.result !== 'OK') 
      return res.render('register', {
        title: 'Registration Error',
        errors: result
      });

      db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
        if (error) throw error;

        user_id = results[0];
        
        req.login(user_id, function(err){
          res.redirect('/');
          //res.render('/', { title: 'Registration complete' });
        });
      });
    } 
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

function authenticationMiddleware() {  
	return (req, res, next) => {
	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}

// What happens after pressing 'Submit' button on the cart page:
router.post('/cart', async function(req, res, next) {

  req.checkBody('firstName', 'Given name field cannot be empty.').notEmpty();
  req.checkBody('firstName', 'Given name field must be between 1-15 characters long.').len(0, 15);
  req.checkBody('lastName', 'Family name field must be between 1-15 characters long.').len(0, 15);
  req.checkBody('phone', 'The phone you entered is invalid, please try again.').matches(/^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/, "i");
  req.checkBody('address', 'Address field cannot be empty.').notEmpty();
  req.checkBody('address', 'Address field must be between 0-60 characters long.').len(0, 60);
  req.checkBody('orderDescription', 'Short description of the problem field must be between 0-300 characters long.').len(0, 300);
  
  const errors = req.validationErrors();
  
  if (errors) {
    res.render('cart', {
      title: 'An error occurred while placing your order',
      errors: errors
    });
  } else {

      const setCredentials = function (userID, firstName, lastName, address, phone) {
        return new Promise ((resolve, reject )=>{
          const db = require('../db.js');
          db.query(`UPDATE users SET firstName=?, lastName=?, address=?, phone=? WHERE id=${userID}`, [firstName, lastName, address, phone], function(error, results, fields){
            if (error) reject(error);
            else resolve(results[0]);
          });
        }); 
      }

      const addInfoToOrder = function (userID, orderDescription, firstName, lastName, address, phone) {
        return new Promise ((resolve, reject )=>{
        const db = require('../db.js');
        db.query(`INSERT INTO orders (user_id, description, timePlaced, status, firstName, lastName, address, phone) VALUES (?, ?, CURRENT_TIMESTAMP(), "New", ?, ?, ?, ?)`, [userID, orderDescription, firstName, lastName, address, phone], function(error, results, fields){
          if (error) reject(error);
          else resolve(results[0]);
          });
        }); 
      }

      const getOrderID = function () {
        return new Promise ((resolve, reject)=>{
        const db = require('../db.js');
        db.query('SELECT LAST_INSERT_ID() as order_id', async function(error, results, fields){
          if (error) reject(error);
          else resolve(results[0].order_id);
          });
        }); 
      }

      const mapDB = async function (data, handler) {
        return Promise.all(
        data.map(async function (service) {
          return await handler(service);
        }));
      }

      const addServicesToOrder = function (item) {
        return new Promise ((resolve, reject )=>{
          const db = require('../db.js');
          db.query(`INSERT INTO servicesInOrders (order_id, service_id, qty) VALUES (?, ?, ?)`, [order_id, item.item.id, item.qty ], function(error, results, fields){
            if (error) reject(error);
            else resolve(results[0]);
          });
        }); 
      }

      const makeOrder = async (saveInfo) => {
        try {
          const firstName = req.body.firstName;
          const lastName = req.body.lastName;
          const address = req.body.address;
          const phone = req.body.phone;
          const orderDescription = req.body.orderDescription;
          const userID = req.user.user_id;
          const cart = new Cart(req.session.cart);
          const db = require('../db.js');
          
          // Update customer's credentials if 'use for future orders' is ticked:
          if (saveInfo) await setCredentials(userID, firstName, lastName, address, phone);
          
          // Add user credentials and order description to new order:
          await addInfoToOrder(userID, orderDescription, firstName, lastName, address, phone);
        
          order_id = await getOrderID();
      
          // Add services to new order:
          await mapDB(cart.generateArray(), addServicesToOrder);

          const customerInfo = await getCustomerInfo(order_id);

          // Send notification to customer:
          const message = {
            from: 'sender@company.com', // Sender address
            to: customerInfo.email,         // List of recipients
            bcc: 'sender@company.com',
            subject: `Order ${order_id} has been placed`, // Subject line
      
            html: `
            <p>Dear ${customerInfo.firstName !== 'NULL' ? `, ${customerInfo.firstName},` : `customer,`}</p>
            <p>We received your order consisting of the following items:</p>
            <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Service</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Price</th>>
                  </tr>
                </thead>
                <tbody>
                ${cart.generateArray().map((service, i) => {              
                  return `
                  <tr>
                    <th scope="row">${i + 1}</th>
                    <td>${service.item.service_name}</th>
                    <td>${service.qty}</td>
                    <td>$${service.price}</td>
                  </tr>`
                  }).join('')}
                </tbody>
            </table>
            <h4>The total price of your order is $${cart.totalPrice}.</h4>
            <p>Thank you for your order! Our specialists will follow up with you shortly.</p>
            <p>With best regards,</p>
            <p>Tramlaw team</p>
            `
          };
          transport.sendMail(message, function(err, info) {
            if (err) throw err;
          });
          return req.session.cart = {};
        } catch (err) {
            throw err;
          }

      }
      try {
      await makeOrder(req.body.saveInfo);
      res.redirect('/orders');
      } catch (err) {
          res.render('cart', {
            title: 'An error occurred while placing your order',
            errors: [{msg: DBErrorMsg.msg}]
          });
        }
  } 
});


router.use(express.static('public'));
router.use(express.json({ limit: '1mb' }))

const callToDB = function (service) {
return new Promise ((resolve, reject )=>{
  const db = require('../db.js');
    db.query(`SELECT service_name, price from services WHERE id=${service}`, function(error, results, fields){
      if (error) reject(error);
      else resolve(results[0]);
      });
    });
};

const callToDB2 = async function (data) {
  return Promise.all(
  data.map(async function (service) {
    return await callToDB(service);
  }));

}

router.post('/api', async (request, response) => {
  response.json(await callToDB2(request.body));
});


const getOrders = function (user_id) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT orders.id, orders.timePlaced, orders.status, sum( qty ) serv_order, sum(price*qty ) orderPrice
        FROM orders, servicesInOrders, 	services serv
        WHERE orders.id = servicesInOrders.order_id
        and serv.id=  servicesInOrders.service_id
        and user_id = ?
        group by orders.id, orders.timePlaced, orders.status
        order by orders.id;`, [user_id], function(error, results, fields){
        if (error) reject(error);
        else resolve(results);
        });
      });
  };

router.post('/getOrders', async (req, res) => {
  try{
  res.json(await getOrders(req.user.user_id));
  } catch (error) {
    res.json(DBErrorMsg);
  }
});

const cancelOrder = function (orderID) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`UPDATE orders SET status='Cancelled' WHERE id=?;`,[orderID] ,function(error, results, fields){
        if (error) reject(error);
        else resolve("OK");
        });
      });
  };
  
router.post('/cancelOrder', async (request, response) => {
  try {
  const orderID = request.body.data; 
  response.json(await cancelOrder(orderID));
  const customerInfo = await getCustomerInfo(orderID);
  const message = {
    from: 'sender@company.com', // Sender address
    to: customerInfo.email,         // List of recipients
    bcc: 'sender@company.com',
    subject: `Order ${orderID} has been cancelled`, // Subject line

    html: `
    <p>Dear ${customerInfo.firstName},</p>
    <p>Your order ${orderID} has been cancelled.</p>
    <p>With best regards,</p>
    <p>Tramlaw team</p>
    `
  };
  transport.sendMail(message, function(err, info) {
    if (err) {
      throw err;
    }
  });
  } catch (err) {
    response.json(DBErrorMsg);
    }
});

router.get('/addToCart/:id', authenticationMiddleware(), function(req, res){
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  const db = require('../db.js');
  db.query(`select * from services where id=${productId};`,function(error, results, fields){
    if (error) throw error;
    try {
    cart.add(results[0], productId);
    req.session.cart = cart;
    res.redirect('/');
    } catch (err) {
      res.json([{msg: "There was an error processing your request."}]);
    }
    });
});

router.get('/remove/:id', authenticationMiddleware(), function(req, res){
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  if (cart.totalQuantity === 0) {
    res.redirect('/');
    return;
  }
  try {
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/cart');
  } catch (err) {
    res.json([{msg: "There was an error processing your request."}]);
  }
});

const getServicesInOrders = function (order_id) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT services.id, services.service_name, servicesInOrders.qty, servicesInOrders.qty * services.price price
        FROM services, servicesInOrders
        WHERE services.id = servicesInOrders.service_id
        AND order_id = ?;`, [order_id], function(error, results, fields){
        if (error) reject(error);
        else resolve(results);
        });
      });
  };

const getCustomerEmail = function (user_id) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT email from users where id = ?;`, [user_id], function(error, results, fields){
        if (error) reject(error);
        else resolve(results[0]);
        });
      });
  };

const getOrderDetails = function (order_id) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT orders.id, orders.timePlaced, orders.status, sum( qty ) serv_order, sum(price*qty ) orderPrice, orders.firstName, orders.lastName, orders.address, orders.phone, orders.description
        FROM orders, servicesInOrders, services serv
        WHERE orders.id = servicesInOrders.order_id
        and serv.id= servicesInOrders.service_id
        and orders.id = ?
        group by orders.id, orders.timePlaced, orders.status
        order by orders.id;`, [order_id], function(error, results, fields){
        if (error) reject(error);
        else resolve(results[0]);
        });
      });
  };

router.post('/getOrderDetails', async (req, res) => {
  try{
  res.json(Object.assign(await getOrderDetails(req.body.orderID), await getCustomerEmail(req.user.user_id), {servicesInOrders: await getServicesInOrders(req.body.orderID)}));
  } catch (err) {
    res.json(DBErrorMsg);
  }
});

const checkOrderStatus = function (orderID) {
  return new Promise ((resolve, reject)=>{
    const db = require('../db.js');
    db.query(`
    SELECT status from orders where id = ?;`, [orderID], function(error, results, fields){
      if (error) reject(error);
      else resolve(results[0].status);
      });
    });
};

const removeService = function (orderID, serviceID) {
  return new Promise ((resolve, reject)=>{
    const db = require('../db.js');
    db.query(`
    DELETE from servicesInOrders
      WHERE order_id = ? and service_id = ?;`, [orderID, serviceID], function(error, results, fields){
      if (error) reject(error);
      else resolve(results[0]);
      });
    });
};

router.post('/removeService', async (req, res) => {
  try{
    const orderStatus = await checkOrderStatus(req.body.orderID);
  if (orderStatus !== 'New') return res.json({result: "statusChanged", msg: orderStatus});
  await removeService(req.body.orderID, req.body.serviceID);
  res.json({result: "OK"});
  } catch (err) {
    res.json(DBErrorMsg);
  }
});

const setOrderDescription = function (orderID, description) {
  return new Promise ((resolve, reject)=>{
    const db = require('../db.js');
    db.query(`
    UPDATE orders orders SET description=?
      WHERE id=?;`, [description, orderID], function(error, results, fields){
      if (error) reject(error);
      else resolve(results[0]);
      });
    });
};

router.post('/setOrderDescription', async (req, res) => {
  try{
    const orderStatus = await checkOrderStatus(req.body.orderID);
    if (orderStatus !== 'New') return res.json({result: "statusChanged", msg: orderStatus});
    await setOrderDescription(req.body.orderID, req.body.description);
    res.json({result: "OK"});
  } catch (error) {
    res.json(DBErrorMsg);
  }
});

// Customer's profile
const updateCredentials = function (userID, email, firstName, lastName, address, phone) {
  return new Promise ((resolve, reject)=>{
    const db = require('../db.js');
    db.query(`

    UPDATE users SET email=?, firstName=?, lastname=?, address=?, phone=?
      WHERE id=?;`, [email, firstName, lastName, address, phone, userID], function(error, results, fields){
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') reject([{result: "duplicatedEntry", msg: "An account with this email already exists."}]);
        else reject([DBErrorMsg]);
      }
      else resolve({result: "OK"});
      });
    });
};

router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Profile', script: 'profileController.js', active: {profile: true } });
});

router.post('/updateCredentials', async function(req, res, next) {
  try {
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('firstName', 'Given name field must be between 1-15 characters long.').len(0, 15);
    req.checkBody('lastName', 'Family name field must be between 1-15 characters long.').len(0, 15);
    req.checkBody('phone', 'The phone you entered is invalid, please try again.').matches(/^$|^(?:\+?(61))? ?(?:\((?=.*\)))?(0?[2-57-8])\)? ?(\d\d(?:[- ](?=\d{3})|(?!\d\d[- ]?\d[- ]))\d\d[- ]?\d[- ]?\d{3})$/, "i");
    req.checkBody('address', 'Address field must be between 0-60 characters long.').len(0, 60);
    
    const errors = req.validationErrors();

    if (errors) {
        res.json(errors );

    } else {
      try {
      const result = await updateCredentials(req.user.user_id, req.body.email, req.body.firstName, req.body.lastName , req.body.address , req.body.phone);
      res.json(result);
      } catch (error) {
        res.json(error);
      }
    }
  } catch (error) {
    res.json(DBErrorMsg);
  }
});

const getCredentials = function (user_id) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT username, email, firstName, lastName, address, phone
        FROM users where id=?;`, [user_id], function(error, results, fields){
        if (error) reject (error);
        else resolve(results[0]);
        });
      });
  };

router.post('/getCredentials', async (req, res) => {
  try{
    res.json(await getCredentials(req.user.user_id));
  } catch (error) {
    res.json(DBErrorMsg);
  }
});


const changePassword = function (user_id, password) {
  return new Promise ((resolve, reject )=>{

    const db = require('../db.js');

    bcrypt.hash(password, saltRounds, function(err, hash) {
      db.query(`
      UPDATE users SET password=? where id=?;`, [hash, user_id], function(error, results, fields){
        if (error) reject(error);
        else resolve(results[0]);
      });
    });
  });
};

router.post('/changePassword', async function(req, res, next) {
  try {
    req.checkBody('password', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
    req.checkBody('passwordMatch', 'Password must be between 8-100 characters long.').len(8, 100);
    req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
    
    const errors = req.validationErrors();

    if (errors) {
        res.json(JSON.stringify(errors));
    } else {
      await changePassword(req.user.user_id, req.body.password);
      res.json({result: "OK"});
    }
  } catch (error) {
      res.json(JSON.stringify([DBErrorMsg]));
  }
});

const getAllOrders = function () {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT orders.id, orders.timePlaced, orders.status, sum( qty ) serv_order, sum(price*qty ) orderPrice
        FROM orders, servicesInOrders, 	services serv
        WHERE orders.id = servicesInOrders.order_id
        and serv.id=  servicesInOrders.service_id
        group by orders.id, orders.timePlaced, orders.status
        order by orders.id;`, function(error, results, fields){
        if (error) reject (error);
        else resolve(results);
        });
      });
  };

  function isAdmin() {  
    return (req, res, next) => {
        if (req.user.user_id === 30) return next();
        res.redirect('/login')
    }
  }

router.get('/adm_1', authenticationMiddleware(), isAdmin(), function(req, res){
  res.render('adm_1', { title: 'Admin', script: 'admController.js' });
});

router.post('/getAllOrders', authenticationMiddleware(), isAdmin(), async (req, res) => {
  try{
  res.json(await getAllOrders());
} catch (error) {
    res.json(DBErrorMsg);
}
});

const changeOrderStatus = function (orderID, status) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      UPDATE orders SET status=? where id=?;`, [status, orderID], function(error, results, fields){
        if (error) reject (error);
        else resolve(results);
        });
      });
  };

  router.post('/changeOrderStatus', authenticationMiddleware(), isAdmin(), async function(req, res){
  try{
    const orderID = req.body.orderID;
    await changeOrderStatus(orderID, req.body.status);
    res.json({result: "OK"});
    const customerInfo = await getCustomerInfo(orderID);
    const message = {
      from: 'sender@company.com', // Sender address
      to: customerInfo.email,         // List of recipients
      bcc: 'sender@company.com',
      subject: `Status of order ${orderID} has been changed`, // Subject line

      html: `
      <p>Dear ${customerInfo.firstName},</p>
      <p>Status of your order ${orderID} has been changed to '${req.body.status}'.</p>
      <p>With best regards,</p>
      <p>Tramlaw team</p>
      `
    };
    transport.sendMail(message, function(err, info) {
      if (err) {
        throw err;
      }
    });
  } catch (error) {
    res.json(DBErrorMsg);
  }
});

const getCustomerInfo = function (orderID) {
  return new Promise ((resolve, reject )=>{
    const db = require('../db.js');
      db.query(`
      SELECT users.email, orders.firstName
        FROM users, orders
        WHERE users.id = orders.user_id
        and orders.id = ?;`, [orderID], function(error, results, fields){
        if (error) reject (error);
        else resolve(results[0]);
        });
      });
  };

module.exports = router;