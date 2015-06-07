var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var checkLoaded = require('../common_modules/_loading').checkLoaded;

// Add all listeners down here
var uploadPost = document.getElementById('upload-photo');
var form = document.getElementById('file-field');

// getting current timestamp with timezone

var timeNow = new Date();
var timeNowMs = timeNow.getTime()

uploadPost.addEventListener("submit", function() {

  showLoading();

  var lat = null;
  var lng = null;

  var userId = document.getElementById('user-details').value;

  var statusDiv = document.getElementById('status-text');
  var statusText = statusDiv.value;
  if (statusText == '') {
    statusText = null;
  }

  var postSuccess = false;
  var locationSuccess = false;
  var imgurSuccess = false;
  var imageSuccess = false;

  /*
  (A) -- making the initial post --
  */
  var aBodyData = {
    columns: ['user_id', 'post_timestamp', 'status_entry'],
    values: [[parseInt(userId), timeNowMs, statusText]]
  };

  var aClient = new HttpClient();

  aClient.post(endPoints.writeTable('posts').url, aBodyData, function(aResponse, aStatus) {
    if (aStatus == 201) {
      postSuccess = true;
      checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
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
              locationSuccess = true;
              checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
              console.log('added location!');
            } else {
              locationSuccess = false;
              alert('failed to add location to post');
              console.log(bResponse, bStatus);
            }
          });
        });
      } else {
        locationSuccess = true;
        console.log('device does not have geolocation');
      }

      /*
      (C) -- updating with pictures --
      */
      var test = false;
      if (form.files.length) {
        test = true;
      }
      console.log(form.files, test);

      if (form.files.length) {
        for (var i = 0; i < form.files.length; i++) {
          var file = form.files[i];

          var cClient = new HttpClient();

          cClient.postImgur(file, function(cResponse, cStatus) {
            if (cStatus == 200) {
              imgurSuccess = true;
              checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
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
                  imageSuccess = true;
                  checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
                  console.log('we uploaded and updated images!');
                } else {
                  imageSuccess = false;
                  alert('failed to add imgur URL to post');
                  console.log(dResponse, dStatus);
                }
              });
            } else {
              imgurSuccess = false;
              checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
              console.log('failed to upload to Imgur');
              console.log(cResponse, cStatus);
            }
          });

        }

      } else {
        imageSuccess = true;
        imgurSuccess = true;
        checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
        console.log('no pictures to upload');
      }

    } else {
      postSuccess = false;
      doneLoading();
      alert('failed to make post');
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
