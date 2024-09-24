const { DateTime } = require('luxon');

function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

function convertDate(inputDate) {
  const convertedDate = DateTime.fromObject(inputDate);
  return convertedDate;
}

module.exports = {
  getExt,
  convertDate
}