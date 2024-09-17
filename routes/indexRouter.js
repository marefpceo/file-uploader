const express = require('express');
const router = express.Router();
const index_controller = require('../controllers/indexController');

// GET login page
router.get('/login', (req, res, next) => {
  res.render('login', {
    title: 'Login ',
  });
});

// GET home page
router.get('/', index_controller.index);

// GET sign up page
router.get('/signup', index_controller.signup_get);


module.exports = router;
