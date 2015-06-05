(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3,"./_imgur_upload":4}],2:[function(require,module,exports){
var endPoints = (function() {
  return {

//    saveRoute: {
//      url: 'save-route',
//      methods: ['POST']
//    },

    getUpdatedPosts: {
      url: 'get-updated-posts',
      methods: ['GET']
    },

//    upload: {
//      url: 'upload',
//      methods: ['GET', 'POST']
//    },

//    map: {
//      url: 'map',
//      methods: ['GET']
//    },

    readTable: function(tablename, id) {
      return {
        url: 'read/' + tablename + '/' + id,
        methods: ['GET']
      };
    },

    writeTable: function(tablename) {
      return {
        url: 'write/' + tablename,
        methods: ['POST']
      };
    },

    updateTable: function(tablename) {
      return {
        url: 'update/' + tablename,
        methods: ['PUT']
      };
    },


  };
})();  // Note the closure :)

// Export the endPoints module
exports.endPoints = endPoints;
},{}],3:[function(require,module,exports){
var HttpClient = function() {

  function buildFormData(jsonObj) {
    var encodedData = '';
    var encodedPairs = [];

    for (var key in jsonObj) {
      var value = jsonObj[key];
      encodedPairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }

    // replace spaces with pluses
    encodedData = encodedPairs.join('&').replace(/%20/g, '+');
    return encodedData;
  }

  this.get = function(aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4)
        aCallback(anHttpRequest.responseText, anHttpRequest.status);
    }

    anHttpRequest.open( "GET", aUrl, true );

    anHttpRequest.send( null );
  };

  this.post = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4) {
        aCallback(anHttpRequest.responseText, anHttpRequest.status);
      }
    }

    anHttpRequest.open( "POST", aUrl, true );

    anHttpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    anHttpRequest.send(JSON.stringify(bodyData));
  };

  this.put = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4) {
        aCallback(anHttpRequest.responseText, anHttpRequest.status);
      }
    }

    anHttpRequest.open( "PUT", aUrl, true );

    anHttpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    anHttpRequest.send(JSON.stringify(bodyData));
  };

  this.postImgur = function(imgFile, aCallback) {

    var aUrl = 'https://api.imgur.com/3/image';
    // create new form to send to imgur
    var fd = new FormData();
    fd.append('image', imgFile);

    var anHttpRequest = new XMLHttpRequest();

    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4)
        aCallback(anHttpRequest.responseText, anHttpRequest.status);
    }

    anHttpRequest.open('POST', aUrl);

    var clientId = 'a9cda2e43ea6ba9';
    anHttpRequest.setRequestHeader('Authorization', 'Client-ID ' + clientId)

    anHttpRequest.send(fd);
  };

}

// Export the HttpClient module
exports.HttpClient = HttpClient;
},{}],4:[function(require,module,exports){
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allowspicture uplaod to Imgur
var uploadToImgur = function(ownerId, statusId, geolocationId, timeNowMs) {
  console.log('uploading...');

  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

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
},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3}]},{},[1]);
