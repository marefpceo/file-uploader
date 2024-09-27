const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const helpers = require('../public/javascripts/helpers');
const { unlinkSync } = require('node:fs');

// Get form to create a new folder
exports.create_folder_get = asyncHandler(async (req, res, next) => {
  res.render('folder_form', {
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
        res.render('folder_form', {
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
  const currentUser = await prisma.user.findUnique({
    where: {
      id: req.user
    }
  }); 
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
    folderId: selectedFolder.id,
    user: req.user || null,
    username: `${currentUser.first_name} ${currentUser.last_name}`,
    convertDateFromDb: helpers.convertDateFromDb,
    convertBytes: helpers.convertBytes,
    add_file_path: `/folder/${req.params.folderId}/add_file`
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


exports.add_file_post = [
  body('file_name')
    .if(body('file_name').notEmpty())
    .trim()
    .isLength({ min: 3 })
    .withMessage('File names must be at least 3 characters long')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      const selectedFolder = await prisma.folder.findUnique({
        where: {
          id: parseInt(req.params.folderId)
        }
      });

      const file_data = {
        filename: req.body.file_name === '' ? req.file.originalname : `${req.body.file_name}.${helpers.getExt(req.file.originalname)}`,
        original_name: req.file.originalname,
        file_extension: helpers.getExt(req.file.originalname),
        last_modified: Date.now(),
        file_size: req.file.size,
        file_path: req.file.path,
        mime_type: req.file.mimetype,
        ownerId: req.user,
        folderId: selectedFolder.id,
      }

      if (!errors.isEmpty()) {
        res.render('add_file_to_folder', {
          title: `Add file to ${selectedFolder.folder_name}`,
          user: req.user,
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
        await prisma.file.create({
          data: {
            filename: file_data.filename,
            original_name: file_data.original_name,
            file_extension: file_data.file_extension,
            file_size: file_data.file_size,
            file_path: file_data.file_path,
            mime_type: file_data.mime_type,
            owner: { connect : { id: req.user }},
            folder: { connect: { id: parseInt(file_data.folderId) }}
          }
        });
        res.redirect(`/folder/${req.params.folderId}`);
      }
    })
]


exports.edit_folder_get = asyncHandler(async (req, res, next) => {
  const currentFolder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.folderId)
    }
  });

  res.render('folder_form', {
    title: 'Change folder name',
    folder: currentFolder,
    user: req.user || null,
  });
});


exports.edit_folder_post = [
  body('folder_name')
    .if(body('folder_name').notEmpty())
    .trim()
    .isLength({ min: 3 })
    .withMessage('Folder name must contain at least 3 characters')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render('folder_form', {
        folder_name: req.body.folder_name
      });
      return;
    } else {
      await prisma.folder.update({
        where: {
          id: parseInt(req.params.folderId)
        },
        data: {
          folder_name: req.body.folder_name,
          last_modified: helpers.convertUTCtoISO(Date.now())
        }
      });
      res.redirect(`/folder/${req.params.folderId}`);
    };
  })
];


exports.delete_folder_get = asyncHandler(async (req, res, next) => {
  const currentUser = await prisma.user.findUnique({
    where: {
      id: req.user
    }
  }); 
  const currentFolder = await prisma.folder.findUnique({
    where: {
      id: parseInt(req.params.folderId)
    },
    include: {
      files: true
    }
  });

  res.render('folder_delete', {
    title: currentFolder.folder_name,
    file_list: currentFolder.files,
    user: req.user || null,
    convertDateFromDb: helpers.convertDateFromDb,
    convertBytes: helpers.convertBytes,
    username: `${currentUser.first_name} ${currentUser.last_name}`,
    add_file_path: `/folder/${req.params.folderId}/add_file`
  })
});


exports.delete_folder_post = asyncHandler(async (req, res, next) => {
  if (req.body.delete_files === 'on') {
   await prisma.file.deleteMany({
    where: {
      folderId: parseInt(req.params.folderId)
    }
   });
  }
  await prisma.folder.delete({
    where: {
      id: parseInt(req.params.folderId)
    },
    include: {
      files: true
    }
  });
  
  res.redirect('/');
});
