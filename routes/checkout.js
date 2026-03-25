const express = require('express');
const router = express.Router();

const Order = require('../models/order');
const Cart = require('../models/cart');
const { stripeSecretKey, stripePublishableKey } = require('../config/env');

router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);
  const errMsg = req.flash('error')[0];
  return res.render('shop/checkout', {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg,
    publishableKey: stripePublishableKey,
  });
});

router.post('/checkout', isLoggedIn, async function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = new Cart(req.session.cart);
  const stripe = require('stripe')(stripeSecretKey);

  try {
    const charge = await stripe.charges.create({
      amount: cart.totalPrice * 100,
      currency: 'usd',
      source: req.body.stripeToken,
      description: 'Test Charge',
    });

    const order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id,
    });

    await order.save();
    req.flash('success', 'Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/checkout');
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

module.exports = router;
