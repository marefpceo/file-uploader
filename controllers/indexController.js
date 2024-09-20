const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { unlinkSync } = require('node:fs');


// Displays index page  
exports.index = asyncHandler(async (req, res, next) => {
  res.render('index', {
    title: 'File Uploader',
    user: req.user
  });
});


// Displays login page
exports.login_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render('login', {
      title: 'Login',
      user: req.user || null
    });
  } else {
    res.redirect('/');
  }
});


// Displays user signup page
exports.signup_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.render('signup', {
      title: 'Sign up for an account',
      user: req.user || null
    });
  } else {
    res.redirect('/');
  }
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
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await prisma.user.create({
        data: {
          first_name: signupInput.first_name,
          last_name: signupInput.last_name,
          email: signupInput.email,
          password: hashedPassword
          },
        });
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    }
  })
];


exports.upload_get = asyncHandler(async (req, res, next) => {
  const user_folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user
    },
  });

  console.log(user_folders);

  res.render('upload_file', {
    title: 'Select a file to upload',
    user: req.user || null,
    folders: user_folders
  });
});


exports.upload_post = [
  body('file_name')
    .if(body('file_name').notEmpty())
    .trim()
    .isLength({ min: 3 })
    .withMessage('File name must be at least 3 characters long.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const ext = req.file.originalname.split('.'); // Working on extracting the file's extension
    const file_data = {
      filename: req.body.file_name === '' ? req.file.originalname : req.body.file_name,
      original_name: req.file.originalname,
      last_modified: Date.now(),
      file_size: req.file.size,
      file_path: req.file.path,
      mime_type: req.file.mimetype,
      ownerId: req.user,
      folderId: req.body.folder,
    }
    
    const user_folders = await prisma.folder.findMany({
      where: {
        ownerId: req.user
      },
    });

    if (!errors.isEmpty()) {
      res.render('upload_file', {
        title: 'Select a file to upload',
        user: req.user || null,
        folders: user_folders,
        errors: errors.array()
      });

      try {
        unlinkSync(`${file_data.file_path}`);
      } catch (err) {
        console.log(err);
        return next(err);
      }

      return;
    } else {
      res.json({
        message: 'Uploaded file info',
        data: req.file,
        db_ready_data: file_data,
      });
    }
  })
];
