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