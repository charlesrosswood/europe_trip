var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allowspicture uplaod to Imgur
var geolocationUpload = function(ownerId, timeNowMs, callback) {

  var geolocationDiv = document.getElementById('geolocation');
  var placeNameDiv = document.getElementById('placename-input');

  var lng = geolocationDiv.getAttribute('data-longitude');
  var lat = geolocationDiv.getAttribute('data-latitude');

  if (lng !== null) {
    lng = Number(lng);
  } else {
    lng = -1000;
  }

  if (lat !== null) {
    lat = Number(lat);
  } else {
    lat = -1000;
  }


  var placename = null;
  if (placeNameDiv !== null) {
    placename = placeNameDiv.value;
  }

  var bodyJson = {
    columns: ['users_id', 'name', 'latitude', 'longitude', 'entry_timestamp'],
    values: [[ownerId, placename, lat, lng, timeNowMs]]
  };
  var aClient = new HttpClient();

  aClient.post(endPoints.writeTable('geolocations').url, bodyJson, callback);

}

// export module public APIs here
exports.geolocationUpload = geolocationUpload;