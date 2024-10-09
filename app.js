require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Setup for session store 
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');

const indexRouter = require('./routes/indexRouter');
const passport = require('passport');

const app = express();

/////////////////////////////////
//////// Production Item ////////
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
/////////////////////////////////


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/////////////////////////////////
//////// Production Item ////////
app.disable('x-powered-by');
app.use(helmet());
app.use(compression());
app.use(limiter);
/////////////////////////////////


app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);
app.use(passport.authenticate('session'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : err.status;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
