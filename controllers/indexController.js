const express = require('express');
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  res.render('index', {
    title: 'File Uploader'
  });
});

exports.signup_get = asyncHandler(async (req, res, next) => {
  res.render('signup', {
    title: 'Sign up for an account'
  });
});
