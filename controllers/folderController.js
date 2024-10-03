const asyncHandler = require('express-async-handler');
const { check, body, validationResult } = require('express-validator');
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const helpers = require('../public/javascripts/helpers');

const cloudinary = require('cloudinary').v2;

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
      const folder = {
        folder_name: req.body.folder_name
      };

      if(!errors.isEmpty()) {
        res.render('folder_form', {
          title: 'Create a new folder',
          folder: folder,
          user: req.user,
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
  check('file_select')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file selected');
      }
      return true;
    }),
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
      let user = Prisma.UserCreateInput;

      if (!errors.isEmpty()) {
        res.render('add_file_to_folder', {
          title: `Add file to ${selectedFolder.folder_name}`,
          user: req.user,
          errors: errors.array()
        }); 
        return;
      } else {
        const formatDisplayName = req.body.file_name === '' ? req.file.originalname :
            `${req.body.file_name}.${helpers.getExt(req.file.originalname)}`;

        const uploadResult = await new Promise((resolve) => {
          cloudinary.uploader.upload_stream({
            unique_filename: true,
            transformation: {
              flags: "attachment:" + `${helpers.escapePeriods(formatDisplayName)}`
            },  
            display_name: formatDisplayName,
            asset_folder: req.user
          }, (error, uploadResult) => {
            if (error) {
              next(error);
            }
            return resolve(uploadResult);
          }).end(req.file.buffer);
        });

        user = {
          filename: uploadResult.display_name,
          original_name: req.file.originalname,
          file_extension: helpers.getExt(req.file.originalname),
          file_size: req.file.size,
          file_path: uploadResult.secure_url,
          mime_type: req.file.mimetype,
          owner: { connect: { id: req.user }},
          folder: { connect: { id: parseInt(req.params.folderId) }}  
        }

        await prisma.file.create({ data: user });
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
    const folder = await prisma.folder.findUnique({
      where: {
        id: parseInt(req.params.folderId)
      }
    });

    if(!errors.isEmpty()) {
      res.render('folder_form', {
        title: 'Change folder name',
        folder: folder,
        user: req.user, 
        errors: errors.array()
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
    add_file_path: `/folder/${req.params.folderId}/add_file`,
    previous_page: req.get('referer')
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
