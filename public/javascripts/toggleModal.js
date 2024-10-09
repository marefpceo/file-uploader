
  
// Show or hide file modal
function toggleModal(file) {
  let fileModalDisplay = document.getElementById('file-modal');
  
  if (!fileModalDisplay.style.display || fileModalDisplay.style.display == 'none') {
    fileModalDisplay.style.display = 'flex';
    document.getElementById('content-header').innerHTML = file.filename;
    document.getElementById('modal-content-body').innerHTML = modalBodyOutput(file.last_modified, 
      file.file_size);
    document.getElementById('modal-content-footer').innerHTML = modalFooterOutput(file.id);
  } else {
    fileModalDisplay.style.display = 'none';
  }
}

function modalBodyOutput(modified, size) {
  const htmlOutput = `
    <p><strong>Last modified:</strong> <br>${modified}</p>
    <p><strong>Size: </strong> <br>${size}</p>
  `
  return htmlOutput;
}

function modalFooterOutput(fileId) {
  const htmlOutput = `
      <a href='/file/${fileId}'><img src='/images/download-icon.png' alt='Download file'></a>
      <a href='/file/${fileId}/edit'><img src='/images/edit-icon.png' alt='Edit file name'></a>
      <a href='/file/${fileId}/delete'><img src='/images/delete-icon.png' alt='Delete file'></a>
  `
  return htmlOutput;
}