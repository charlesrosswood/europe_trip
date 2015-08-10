var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allows picture upload to Imgur
var uploadToImgur = function(ownerId, statusId, geolocationId, timeNowMs) {
  console.log('uploading...');

  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    console.log('file', file);

    var aClient = new HttpClient();

    aClient.postImgur(file, function(response) {
      var imgurResponse = JSON.parse(response);
      var imgurUrl = imgurResponse.data.link;
      var imgurDeleteHash = imgurResponse.data.deletehash;
      console.log(imgurUrl);

      var bClient = new HttpClient();

      var tableData = {
        'columns' :['users_id', 'geolocations_id', 'image_url', 'delete_hash',
        'status_entries_id', 'entry_timestamp'],
        'values': [[ownerId, geolocationId, imgurUrl, imgurDeleteHash, statusId, timeNowMs]]
      };

      bClient.post(endPoints.writeTable('photo_uploads').url, tableData, function(response,
      status) {
        console.log(response, status);
      });

    });

  }
}

// Create the DOM for the iage preview
var createImgPreview = function(imageFileObject) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var imgPrevEle = document.createElement('IMG');
    imgPrevEle.setAttribute('src', e.target.result);

    imgPrevEle.className = 'upload-img-prev';
    imgPrevEle.setAttribute('src', e.target.result);

    var parentNode = document.getElementById('img-preview');
    parentNode.appendChild(imgPrevEle);
  }

  reader.readAsDataURL(imageFileObject);
}


// export module public APIs here
exports.uploadToImgur = uploadToImgur;
exports.createImgPreview = createImgPreview;