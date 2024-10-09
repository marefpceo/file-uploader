const { DateTime } = require('luxon');

function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

// Double escapes periods that are in file names in order to be accepted by cloudinary
function escapePeriods(inputStr) {  
  const escapedStr = inputStr.replace('.', '%252E');
  return escapedStr;
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

// Convert bytes to human readable format
function convertBytes(inputFileSize) {
  const input = inputFileSize;
  const digitCount = parseInt(input.toString().length, 10);
  let temp = 0;

  switch(digitCount) {
    case 4:
    case 5:
    case 6: 
      temp =  (input * 0.0009765625).toFixed(1);
      return `${temp} kB`;
    
    case 7:
      temp = (input * 9.5367431640625E-7 ).toFixed(1);
      return `${temp} MB`;

    default:
      return `${input} bytes`;
  }
}

module.exports = {
  getExt,
  convertDateFromDb,
  convertUTCtoISO,
  convertBytes,
  escapePeriods
}