const { DateTime } = require('luxon');

function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

function convertDate(inputDate) {
  const date = DateTime.fromObject(inputDate);
  const convertedDate = date.toLocaleString(DateTime.DATETIME_MED);
  return convertedDate;
}

module.exports = {
  getExt,
  convertDate
}