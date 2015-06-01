var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var createImgPreview = require('./_imgur_upload').createImgPreview;

// Add all listeners down here
var uploadPhoto = document.getElementById('upload-photo');
uploadPhoto.addEventListener("submit", function() {
  var owner = 'me';
  var statusId = 1;

  uploadToImgur(owner, statusId);
});

var chooseImage = document.getElementById('file-field');
chooseImage.addEventListener("change", function() {
  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    createImgPreview(file);
  }
});
