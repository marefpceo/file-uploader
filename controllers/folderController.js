const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const helpers = require('../public/javascripts/helpers');

// Get form to create a new folder
exports.create_folder_get = asyncHandler(async (req, res, next) => {
  res.render('create_folder', {
    title: 'Create a new folder',
    user: req.user || null,
  });
});


// Handle create folder
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


// Get list of files from selected folder
exports.folder_file_list_get = asyncHandler(async (req, res, next) => {
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.folderId)
    },
    include: {
      files: true
    },
  });
  
  res.render('folder_file_list', {
    title: selectedFolder.folder_name,
    file_list: selectedFolder.files,
    user: req.user || null
  })
});


exports.add_file_get = asyncHandler(async (req, res, next) => {
  const selectedFolder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.folderId)
    }
  });

  res.render('add_file_to_folder', {
    title: `Add file to ${selectedFolder.folder_name}`,
    user: req.user
  });
});
