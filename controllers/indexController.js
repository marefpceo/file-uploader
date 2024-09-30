const asyncHandler = require('express-async-handler');
const { check, body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { unlinkSync } = require('node:fs');
const helpers = require('../public/javascripts/helpers');



// Displays index page  
exports.index = asyncHandler(async (req, res, next) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: req.user
    },
    include: {
      folders: true,
      files: true
    }
  });

  res.render('index', {
    title: 'File Uploader',
    user: req.user,
    username: `${currentUser.first_name} ${currentUser.last_name}`,
    file_list: currentUser.files,
    folder_list: currentUser.folders,
    convertDateFromDb: helpers.convertDateFromDb,
    convertBytes: helpers.convertBytes,
    add_file_path: '/upload_file'
  });
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
  check('file_select')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      return true;
    }),
  body('file_name')
    .if(body('file_name').notEmpty())
    .trim()
    .isLength({ min: 3 })
    .withMessage('File name must be at least 3 characters long.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
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
        if (!req.file) { return };
        unlinkSync(`${req.file.path}`);
      } catch (err) {
        console.log(err);
        return next(err);
      }
      return;
    } else {
      user = {
        filename: req.body.file_name === '' ? req.file.originalname : 
          `${req.body.file_name}.${helpers.getExt(req.file.originalname)}`,
        original_name: req.file.originalname,
        file_extension: helpers.getExt(req.file.originalname),
        file_size: req.file.size,
        file_path: req.file.path,
        mime_type: req.file.mimetype,
        owner: { connect: { id: req.user }},
      }
      if (req.body.folder !== '') {
        user.folder = { connect: { id: parseInt(req.body.folder) }};
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


exports.create_folder_post = [
  body('folder_name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Folder name must be at least 3 characters in length')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);

      if(!errors.isEmpty()) {
        res.render('create_folder', {
          title: 'Create a new folder',
          folder_name: req.body.folder_name,
          errors: errors.array()
        });
        return;
      } else {
        await prisma.folder.create({
          data: {
            folder_name: req.body.folder_name,
            owner: { connect: { id: req.user }}
          }
        });
        res.redirect('/');
      }
    })
];

