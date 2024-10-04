let fileModalDisplay = document.getElementById('file-modal');
  
// Show or hide file modal
function toggleModal() {
  if (fileModalDisplay.style.display == 'none') {
    fileModalDisplay.style.display = 'flex';
  } else {
    fileModalDisplay.style.display = 'none';
  }
}
