var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var addClass = require('../common_modules/_modify_classes').addClass;
var removeContents = require('../common_modules/_dom_manipulation').removeContents;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var checkLoaded = require('../common_modules/_loading').checkLoaded;
var fetchUserAuth = require('../common_modules/_auth').fetchUserAuth;

function checkAuthThenUpload(params) {
  fetchUserAuth(params, uploadPostToServer);
}

// Allows picture upload to Imgur
function uploadPostToServer(params, userData) {
  var postSuccess = false;
  var locationSuccess = false;
  var imgurSuccess = false;
  var imageSuccess = false;

  console.log(userData);

  /*
  (A) -- making the initial post --
  */
  var aBodyData = {
    columns: ['user_id', 'post_timestamp', 'status_entry'],
    values: [[parseInt(userData.userId), params.postTimestamp, params.statusText]],
    auth_token: userData.authToken
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
      if (params.lat && params.lng) {
        var bBodyData = {
          set_clauses: [
            'latitude='.concat(params.lat),
            'longitude='.concat(params.lng)
          ],
          where_clauses: ['id='.concat(postId)],
          auth_token: userData.authToken
        };

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
      }

      /*
      (C) -- updating with pictures --
      */
      if (params.files) {
        for (var i = 0; i < params.files.length; i++) {
          var file = params.files[i];

          var cClient = new HttpClient();

          cClient.postImgur(file, function(cResponse, cStatus) {
            if (cStatus == 200) {
              imgurSuccess = true;
              checkLoaded(postSuccess, locationSuccess, imgurSuccess, imageSuccess);
              var imgurResponse = JSON.parse(cResponse);
              var imgurUrl = imgurResponse.data.link;
              var imgurDeleteHash = imgurResponse.data.deletehash;

              var dBodyData = {
                columns: ['post_id', 'image_url', 'image_deletehash'] ,
                values: [[parseInt(postId), imgurUrl, imgurDeleteHash]],
                auth_token: userData.authToken
              };

              var dClient = new HttpClient();

              dClient.post(endPoints.writeTable('images').url, dBodyData, function(dResponse,
              dStatus) {
                if (dStatus == 201) {
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
              doneLoading();
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

}


// Create the DOM for the iage preview
var createImgPreview = function(imageFileObject) {
  var parentNode = document.getElementById('img-preview');
  removeContents(parentNode);

  var reader = new FileReader();
  reader.onload = function(e) {
    var imgPrevEle = document.createElement('IMG');
    imgPrevEle.setAttribute('src', e.target.result);
    addClass(imgPrevEle, 'upload-img-prev');
    addClass(imgPrevEle, 'horiz-center');
    imgPrevEle.setAttribute('src', e.target.result);

    parentNode.appendChild(imgPrevEle);
  }

  reader.readAsDataURL(imageFileObject);
}


// export module public APIs here
exports.uploadPostToServer = checkAuthThenUpload;
exports.createImgPreview = createImgPreview;