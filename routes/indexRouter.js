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

// GET signup page
router.get('/signup', index_controller.signup_get);

// POST signup page
router.post('/signup', index_controller.signup_post);


module.exports = router;
