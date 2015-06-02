var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var statusUpload = require('./_status_upload').statusUpload;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var geolocationUpload= require('./_geolocation_upload').geolocationUpload;

// Add all listeners down here
var uploadPhoto = document.getElementById('upload-photo');
uploadPhoto.addEventListener("submit", function() {

  var ownerId = document.getElementById('user-details').value;

  console.log(ownerId);
  geolocationUpload(ownerId, function(response) {
    var geolocationId = response.result[0].geolocations_id;

    statusUpload(ownerId, geolocationId, function(response) {
      var response = JSON.parse(response);
      var statusId = response['result'][0]['status_entries_id']
      uploadToImgur(ownerId, statusId, geolocationId);
    });

  });
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

var geolocationButton = document.getElementById('geolocation-button');
geolocationButton.addEventListener('click', function() {

  var geolocationDiv = document.getElementById('geolocation');

  var para = document.createElement('p');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {

      var placeNameNode = document.createElement('input');
      placeNameNode.setAttribute('placeholder', 'Placename...');
      placeNameNode.setAttribute('id', 'placename-input');
      geolocationDiv.appendChild(placeNameNode);

      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      para.innerHTML = 'Latitude: ' + lat + '<br/>Longtiude: ' + lng;
      geolocationDiv.appendChild(para);

      geolocationDiv.setAttribute('data-longitude', lng);
      geolocationDiv.setAttribute('data-latitude', lat);
    });
  } else {
    var node = document.createTextNode('Location not available');
    para.appendChild(node);
    geolocationDiv.appendChild(paraNode);
  }
});
