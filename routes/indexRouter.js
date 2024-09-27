const express = require('express');
const router = express.Router();
const index_controller = require('../controllers/indexController');
const folder_controller = require('../controllers/folderController');
const file_controller = require('../controllers/fileController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const multer = require('multer');

// Configure file storage location and naming convention
const storage = multer.diskStorage({
  // Define the destination to save the file
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },

  // Create a new file name with extension and unique identifier. All spaces are also
  // replaced with an underscore '_'
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const nameSplit = file.originalname.toLowerCase().replace(/ /g, '_').split('.');
    cb(null, nameSplit[0] + '-' + uniqueSuffix + '.' + nameSplit[1]);
  }
});

const upload = multer({ storage: storage });


// Passport LocalStrategy configuration to verify email and password for authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if(user === null) {return done(null, false, { message: 'User does not exist'})};
    
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
  done(null, user.id);
});


// Deserialize user session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      }
    });
    done(null, user.id);
  } catch(err) {
    done(err);
  };
});


// Checks if user is logged in
function validationCheck(req, res, next) {
  if (!req.user) {
    const err = new Error('Unauthorized Access');
    err.status = 401;
    return next(err);
  } else {
    next();
  }
}

// Redirects index to login if no users are logged in
function isUserLoggedIn(req, res, next) {
  if (!req.user) {
    res.redirect('/login');
  } else {
    next();
  }
} 


// GET login page
router.get('/login', index_controller.login_get);


// POST login page
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  })
);


// POST logout user
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});



/****************************************************************/
/*********************** Main Page routes ***********************/
/****************************************************************/

// GET home page
router.get('/', isUserLoggedIn, index_controller.index);

// GET signup page
router.get('/signup', index_controller.signup_get);

// POST signup page
router.post('/signup', index_controller.signup_post);

// GET file upload page
router.get('/upload_file', validationCheck, index_controller.upload_get);

// POST file upload page
router.post('/upload_file', validationCheck, upload.single('file_select'), index_controller.upload_post);



/******************************************************************/
/********************* Folder specific routes *********************/
/******************************************************************/

// GET create folder page
router.get('/create_folder', validationCheck, folder_controller.create_folder_get);

// POST create folder
router.post('/create_folder', validationCheck, folder_controller.create_folder_post);

// GET folder file list page
router.get('/folder/:folderId', validationCheck, folder_controller.folder_file_list_get);

// GET add file to current folder
router.get('/folder/:folderId/add_file', validationCheck, folder_controller.add_file_get); 

// POST add file to selected folder
router.post('/folder/:folderId/add_file', validationCheck, upload.single('file_select'), folder_controller.add_file_post);

// GET folder edit form
router.get('/folder/:folderId/edit', validationCheck, folder_controller.edit_folder_get);

// POST folder edit
router.post('/folder/:folderId/edit', validationCheck, folder_controller.edit_folder_post);

// GET folder delete page
router.get('/folder/:folderId/delete', validationCheck, folder_controller.delete_folder_get);

// POST folder delete
router.post('/folder/:folderId/delete', validationCheck, folder_controller.delete_folder_post);



/****************************************************************/
/********************* File specific routes *********************/
/****************************************************************/

// GET form to rename file
router.get('/file/:fileId/edit', validationCheck, file_controller.edit_file_get);

// POST rename file
router.post('/file/:fileId/edit', validationCheck, file_controller.edit_file_post);

// GET delete file page
router.get('/file/:fileId/delete', validationCheck, file_controller.delete_file_get);

// POST delete file
router.post('/file/:fileId/delete', validationCheck, file_controller.delete_file_post);

// GET file download
router.get('/file/:fileId', validationCheck, file_controller.file_download_get);


module.exports = router;
