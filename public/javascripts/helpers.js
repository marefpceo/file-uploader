function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  fileToArray[fileToArray.length - 1];
  return fileExt;
}

module.exports = {
  getExt,
}