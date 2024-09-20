const express = require('express');
const router = express.Router();
const index_controller = require('../controllers/indexController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');


// Passport LocalStrategy configuration to verify email and password for authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(user);
    if(user === null) {return done(null, false, { message: 'User does not exist'})};
    
    const passwordsMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (passwordsMatch) {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Password incorrect'});
    }
  } catch (err) {
    return done(err);
  }
})
);


// Serialize the current session
passport.serializeUser((user, done) => {
  done(null, user.id);
});


// Deserialize user session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      }
    });
    done(null, user.id);
  } catch(err) {
    done(err);
  };
});


// Checks if user is logged in
function validationCheck(req, res, next) {
  if (!req.user) {
    const err = new Error('Unauthorized Access');
    err.status = 401;
    return next(err);
  } else {
    next();
  }
}

// Redirects index to login if no users are logged in
function isUserLoggedIn(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
} 


// GET login page
router.get('/login', index_controller.login_get);


// POST login page
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);


// POST logout user
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});


// GET home page
router.get('/', isUserLoggedIn, index_controller.index);


// GET signup page
router.get('/signup', index_controller.signup_get);


// POST signup page
router.post('/signup', index_controller.signup_post);


module.exports = router;
