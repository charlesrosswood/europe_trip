var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allowspicture uplaod to Imgur
var geolocationUpload = function(ownerId, callback) {

  var geolocationDiv = document.getElementById('geolocation');
  var lng = geolocationDiv.getAttribute('data-longitude');
  var lat = geolocationDiv.getAttribute('data-latitude');

  var placeNameDiv = document.getElementById('placename-input');
  var placename = placeNameDiv.value;

  if ((lng!=null || lng!='') && (lat!=null || lng!='')) {
    lng = Number(lng);
    lat = Number(lat);
    var bodyJson = {
      columns: ['users_id', 'name', 'latitude', 'longitude'],
      values: [[ownerId, placename, lat, lng]]
    };
    var aClient = new HttpClient();

    aClient.post(endPoints.writeTable('geolocations').url, bodyJson, callback);
  } else {
    callback({
      result: [{geolocaions_id:null}]
    });
  }

}

// export module public APIs here
exports.geolocationUpload = geolocationUpload;