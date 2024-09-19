const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');


// Passport LocalStrategy configuration to verify email and password for authentication
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if(!user) {return done(null, false, { message: 'User does not exist'})};
      
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
  done(null, { id: user.id });
});

// Deserialize user session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      }
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});


// Displays index page  
exports.index = asyncHandler(async (req, res, next) => {
  res.render('index', {
    title: 'File Uploader',
    user: req.user
  });
});


// Displays login page
exports.login_get = asyncHandler(async (req, res, next) => {
  res.render('login', {
    title: 'Login'
  });
});

// Logs the user out
exports.logout_post = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});


// Handles login post
exports.login_post = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Incorrect password`')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!errors.isEmpty()) {
      res.render('login', {
        title: 'Login',
        email: req.body.email,
        password: '',
        errors: errors.array(),
      });
      return;
    } else if (user === null) {
      res.render('login', {
        title: 'Login',
        message: 'User not found'
      })
    } else {
      passport.authenticate('local', {
        successRedirect: res.redirect('/'),
        failureRedirect: res.redirect('/login')
      });
    }
  })
];


// Displays user signup page
exports.signup_get = asyncHandler(async (req, res, next) => {
  res.render('signup', {
    title: 'Sign up for an account'
  });
});


// Handle create new user
exports.signup_post = [
  body('first_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First Name has to be at least 2 characters')
    .escape(),
  body('last_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last Name has to be at least 2 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const signupInput = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password
    }

    if (!errors.isEmpty()) {
      res.render('signup', {
        title: 'Sign up for an account',
        first_name: signupInput.first_name,
        last_name: signupInput.last_name,
        email: signupInput.email,
        password: signupInput.password,
        errors: errors.array(),
      });
      return;
    } else {
      await prisma.user.create({
        data: {
          first_name: signupInput.first_name,
          last_name: signupInput.last_name,
          email: signupInput.email,
          password: signupInput.password
          },
        });
      res.redirect('/');
    }
  })
];
