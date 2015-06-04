var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var statusUpload = require('./_status_upload').statusUpload;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var geolocationUpload= require('./_geolocation_upload').geolocationUpload;

// Add all listeners down here
var uploadPost = document.getElementById('upload-photo');

// getting current timestamp with timezone

var timeNow = new Date();
var timeNowMs = timeNow.getTime()

uploadPost.addEventListener("submit", function() {

  var lat = null;
  var lng = null;

  var userId = document.getElementById('user-details').value;

  var statusDiv = document.getElementById('status-text');
  var statusText = statusDiv.value;

  // TODO: 1. make post with status text and user, 2. update if position, 3. update if imgurURL
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {

      lat = position.coords.latitude;
      lng = position.coords.longitude;


  //    var placeNameNode = document.createElement('input');
  //    placeNameNode.setAttribute('placeholder', 'Placename...');
  //    placeNameNode.setAttribute('id', 'placename-input');
  //    geolocationDiv.appendChild(placeNameNode);
  //
  //    para.innerHTML = 'Latitude: ' + lat + '<br/>Longtiude: ' + lng;
  //    geolocationDiv.appendChild(para);
  //
  //    geolocationDiv.setAttribute('data-longitude', lng);
  //    geolocationDiv.setAttribute('data-latitude', lat);
    });
  }



  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    var aClient = new HttpClient();

    aClient.postImgur(file, function(response) {
      var imgurResponse = JSON.parse(response);
      var imgurUrl = imgurResponse.data.link;
      var imgurDeleteHash = imgurResponse.data.deletehash;
    });
  }








  geolocationUpload(ownerId, timeNowMs, function(response, status) {

    var geolocationId = null;
    if (status == 201) {
      var response = JSON.parse(response);
      geolocationId = response.result[0].geolocations_id;
    }

    statusUpload(ownerId, geolocationId, timeNowMs,  function(response, status) {

      var statusId = null;
      if (status == 201) {
        var response = JSON.parse(response);
        var statusId = response.result[0].status_entries_id
      }

      uploadToImgur(ownerId, statusId, geolocationId, timeNowMs);
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




// TODO: is this necessary?
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
