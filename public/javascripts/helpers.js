const { DateTime } = require('luxon');

function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

// Format dates from database to Luxon DATETIME_MED
function convertDateFromDb(inputDate) {
  const convertedDate = DateTime.fromJSDate(inputDate).toLocaleString(DateTime.DATETIME_MED);
  return convertedDate;
}

// Format javascript UTC dates to ISO
function convertUTCtoISO(inputDate) {
  const dt = DateTime.fromMillis(inputDate);
  return dt.toISO();
}

module.exports = {
  getExt,
  convertDateFromDb,
  convertUTCtoISO
}