var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allowspicture uplaod to Imgur
var statusUpload = function(ownerId, geolocationId, callback) {
  console.log('uploading...');

  var statusText = document.getElementById('status-text');

  var bodyJson = {
    columns: ['users_id', 'geolocations_id', 'status_entry'],
    values: [[ownerId, geolocationId, statusText.value]]
  };

  var aClient = new HttpClient();

  aClient.post(endPoints.writeTable('status_entries').url, bodyJson, callback);

}

// export module public APIs here
exports.statusUpload = statusUpload;