function getExt(inputStr) {
  const fileToArray = inputStr.split('.');
  const fileExt =  '.'.concat(fileToArray[fileToArray.length - 1]);
  return fileExt;
}

function getTest() {
  return 'test';
}

module.exports = {
  getExt,
  getTest
}