const express = require('express');

const router = express.Router();
const index_controller = require('../controllers/indexController');





// GET login page
router.get('/login', index_controller.login_get);

// POST login page
router.post('/login', index_controller.login_post);

// POST logout user
router.post('/logout', index_controller.logout_post);

// GET home page
router.get('/', index_controller.index);

// GET signup page
router.get('/signup', index_controller.signup_get);

// POST signup page
router.post('/signup', index_controller.signup_post);


module.exports = router;
