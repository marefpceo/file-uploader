const { DateTime } = require('luxon');

function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

function convertDate(inputDate) {
  const convertedDate = DateTime.fromJSDate(inputDate).toLocaleString(DateTime.DATETIME_MED);
  return convertedDate;
}

module.exports = {
  getExt,
  convertDate
}