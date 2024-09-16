const express = require('express');
const router = express.Router();


// GET login page
router.get('/login', (req, res, next) => {
  res.render('login', {
    title: 'Login ',
  });
});

// GET home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'File Uploader' });
});

// GET sign up page
router.get('/signup', (req, res, next) => {
  res.render('signup', {
    title: 'Sign Up'
  });
});


module.exports = router;
