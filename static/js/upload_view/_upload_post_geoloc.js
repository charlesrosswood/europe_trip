var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

var uploadPostGeo = function(lat, lng, )
   var aClient = new HttpClient();

    aClient.postImgur(file, function(response) {
      var imgurResponse = JSON.parse(response);
      var imgurUrl = imgurResponse.data.link;
      var imgurDeleteHash = imgurResponse.data.deletehash;
    });