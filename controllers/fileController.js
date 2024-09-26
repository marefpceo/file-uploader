const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const helpers = require('../public/javascripts/helpers');


// Get form to rename file
exports.edit_file_get = asyncHandler(async (req, res, next) => {
  const selectedFile = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.fileId)
    }
  });

  res.render('file_form', {
    title: 'Rename File',
    user: req.user,
    file: selectedFile
  })
});


// Handle filename change
exports.edit_file_post = [
  body('file_name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Filename has to be a minimum of 3 characters')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      const selectedFile = await prisma.file.findUnique({
        where: {
          id: parseInt(req.params.fileId)
        }
      });
      
      if(!errors.isEmpty()) {
        res.render('file_form', {
          title: 'Rename File',
          user: req.user,
          file: selectedFile, 
          errors: errors.array()
        });
        return;
      } else {
        const nameToArray = (req.body.file_name).split('.');
        let nameToUpload = '';
        if(nameToArray.length === 1) {
          nameToUpload = `${nameToArray[0]}.${selectedFile.file_extension}`
        } else if ((nameToArray.length > 1) && ((nameToArray[nameToArray.length - 1]) !== selectedFile.file_extension)){
          nameToUpload = `${req.body.file_name}.${selectedFile.file_extension}`;
        } else {
          nameToUpload = req.body.file_name;
        }
        await prisma.file.update({
          where: {
            id: parseInt(req.params.fileId)
          }, 
          data: {
            filename: nameToUpload,
            last_modified: helpers.convertUTCtoISO(Date.now())
          }
        });
        res.redirect('/');
      }
    })
];


exports.delete_file_get = asyncHandler(async (req, res, next) => {
  const currentFile = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.fileId)
    }
  });
  res.render('file_delete', {
    title: currentFile.filename,
    user: req.user,
  });
});


exports.delete_file_post = asyncHandler(async (req, res, next) => {
  const currentFile = await prisma.file.findUnique({
    where: {
      id: parseInt(req.params.fileId)
    }
  })

  if(!currentFile) {
    return;
  }

  await prisma.file.delete({
    where: {
      id: parseInt(req.params.fileId)
    }
  });
  res.redirect('/');
});
