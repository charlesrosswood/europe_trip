var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Add all listeners down here
var uploadPost = document.getElementById('upload-photo');
var form = document.getElementById('file-field');

// getting current timestamp with timezone

var timeNow = new Date();
var timeNowMs = timeNow.getTime()

uploadPost.addEventListener("submit", function() {

  var lat = null;
  var lng = null;

  var userId = document.getElementById('user-details').value;

  var statusDiv = document.getElementById('status-text');
  var statusText = statusDiv.value;
  if (statusText == '') {
    statusText = null;
  }

  /*
  (A) -- making the initial post --
  */
  var aBodyData = {
    columns: ['user_id', 'post_timestamp', 'status_entry'],
    values: [[userId, timeNowMs, statusText]]
  };

  var aClient = new HttpClient();

  aClient.post(endPoints.writeTable('posts').url, aBodyData, function(aResponse, aStatus) {
    if (aStatus == 201) {
      console.log('created post!');
      response = JSON.parse(aResponse);
      var postId = response.result[0].id;

      /*
      (B) -- updating with location --
      */
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          var bBodyData = {
            'set_clauses': [
              'latitude='.concat(lat),
              'longitude='.concat(lng)
            ],
            'where_clauses': ['id='.concat(postId)]
          };

          console.log(bBodyData);

          var bClient = new HttpClient();

          bClient.put(endPoints.updateTable('posts').url, bBodyData, function(bResponse, bStatus) {
            if (bStatus == 200) {
              console.log('added location!');
            } else {
              console.log('failed to add location to post');
              console.log(bResponse, bStatus);
            }
          });
        });
      } else {
        console.log('device does not have geolocation');
      }

      /*
      (C) -- updating with pictures --
      */
      if (form.files) {
        for (var i = 0; i < form.files.length; i++) {
          var file = form.files[i];

          var cClient = new HttpClient();

          cClient.postImgur(file, function(cResponse, cStatus) {
            if (cStatus == 200) {
              var imgurResponse = JSON.parse(cResponse);
              var imgurUrl = imgurResponse.data.link;
              var imgurDeleteHash = imgurResponse.data.deletehash;

              var dBodyData = {
                'set_clauses': [
                  "image_url='".concat(imgurUrl, "'"),
                  "image_deletehash='".concat(imgurDeleteHash, "'")
                ],
                'where_clauses': ['id='.concat(postId)]
              };

              var dClient = new HttpClient();

              dClient.put(endPoints.updateTable('posts').url, dBodyData, function(dResponse,
              dStatus) {
                if (dStatus == 200) {
                  console.log('we uploaded and updated images!');
                } else {
                  console.log('failed to add imgur URL to post');
                  console.log(dResponse, dStatus);
                }
              });
            } else {
              console.log('failed to upload to Imgur');
              console.log(cResponse, cStatus);
            }
          });

        }

      }

    } else {
      console.log('failed to make post');
      console.log(aResponse, aStatus);
    }
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
