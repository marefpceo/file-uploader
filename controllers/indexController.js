const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { unlinkSync } = require('node:fs');
const helpers = require('../public/javascripts/helpers');


// Displays index page  
exports.index = asyncHandler(async (req, res, next) => {
  const fileList = await prisma.file.findMany({
    where: {
      ownerId: req.user
    }
  });

  res.render('index', {
    title: 'File Uploader',
    user: req.user,
    file_list: fileList,
    convertDate: helpers.convertDate
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


// Displays the file upload page
exports.upload_get = asyncHandler(async (req, res, next) => {
  const user_folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user
    },
  });

  res.render('upload_file', {
    title: 'Select a file to upload',
    user: req.user || null,
    folders: user_folders
  });
});


// Handle uploading a file and saving to the database
exports.upload_post = [
  body('file_name')
    .if(body('file_name').notEmpty())
    .trim()
    .isLength({ min: 3 })
    .withMessage('File name must be at least 3 characters long.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const file_data = {
      filename: req.body.file_name === '' ? req.file.originalname : `${req.body.file_name}.${helpers.getExt(req.file.originalname)}`,
      original_name: req.file.originalname,
      file_extension: helpers.getExt(req.file.originalname),
      last_modified: Date.now(),
      file_size: req.file.size,
      file_path: req.file.path,
      mime_type: req.file.mimetype,
      ownerId: req.user,
      folderId: req.body.folder || 0,
    }
    const user_folders = await prisma.folder.findMany({
      where: {
        ownerId: req.user
      },
    });
    
    let user = Prisma.UserCreateInput;

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
      if (file_data.folderId === 0) {
        user = {
          filename: file_data.filename,
          original_name: file_data.original_name,
          file_extension: file_data.file_extension,
          file_size: file_data.file_size,
          file_path: file_data.file_path,
          mime_type: file_data.mime_type,
          owner: { connect : { id: req.user }},
        }
      } else {
        user = {
          filename: file_data.filename,
          original_name: file_data.original_name,
          file_extension: file_data.file_extension,
          file_size: file_data.file_size,
          file_path: file_data.file_path,
          mime_type: file_data.mime_type,
          owner: { connect : { id: req.user }},
          folder: { connect: { id: parseInt(file_data.folderId) }}
        }
      } 
      await prisma.file.create({ data: user });
      res.redirect('/');
    }
  })
];


exports.create_folder_get = asyncHandler(async (req, res, next) => {
  res.render('create_folder', {
    title: 'Create a new folder',
    user: req.user || null,
  });
});
