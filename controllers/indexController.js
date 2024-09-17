const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');


// Displays index page  
exports.index = asyncHandler(async (req, res, next) => {
  res.render('index', {
    title: 'File Uploader'
  });
});


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
      res.send({
        message: 'Signup POST success. Send to db',
        signupInput
      });
    }
  })
];
