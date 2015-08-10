(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var checkLoaded = require('../common_modules/_loading').checkLoaded;
var hasStorage = require('../common_modules/_storage').hasStorage;

// Add all listeners down here
var uploadPost = document.getElementById('upload-photo');
var savePost = document.getElementById('save-button');
var form = document.getElementById('file-field');

// Saving the post to localStorage for offline use
savePost.addEventListener('click', function() {
  showLoading();
  getPostData(savePostToLocalStorage);
});

// Uploading the post to the server
uploadPost.addEventListener('submit', function() {
  showLoading();
  getPostData(uploadPostData);
});

function savePostToLocalStorage(params) {
  if (hasStorage) {
    var filenameList = [];
    if (form.files.length) {
      for (var i = 0; i < form.files.length; i++) {
        var file = form.files[i];
        filenameList.push(file.name);
      }
      params.fileNames = filenameList;
    }
    var localStorageKey = 'post_'.concat(params.timeNowMs);
    localStorage.setItem(localStorageKey, JSON.stringify(params));
    console.log('files', form.files);
    doneLoading();
    var noImgsSaved = "I've saved all the data I could. I can't save images, " +
      "I've saved the names. You'll need to reselect them when you upload later!"
    alert(noImgsSaved);
  } else {
    doneLoading();
    alert('Could not find local storage for offline storage.');
  }
}

function uploadPostToServer(params) {
  var postSuccess = false;
  var locationSuccess = false;
  var imgurSuccess = false;
  var imageSuccess = false;

  /*
  (A) -- making the initial post --
  */
  var aBodyData = {
    columns: ['user_id', 'post_timestamp', 'status_entry'],
    values: [[parseInt(userId), params.timeNowMs, params.statusText]]
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
          'set_clauses': [
            'latitude='.concat(params.lat),
            'longitude='.concat(params.lng)
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
      }

      /*
      (C) -- updating with pictures --
      */
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
                columns: ['post_id', 'image_url', 'image_deletehash'] ,
                values: [[parseInt(postId), imgurUrl, imgurDeleteHash]]
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

function getPostData(callBack) {
  // getting current timestamp with timezone
  var timeNow = new Date();
  var timeNowMs = timeNow.getTime()

  var lat = null;
  var lng = null;

  var userId = document.getElementById('user-details').value;

  var statusDiv = document.getElementById('status-text');
  var statusText = statusDiv.value;
  if (statusText == '') {
    statusText = null;
  }
  var params = {
    timeNowMs: timeNowMs,
    lat: lat,
    lng: lng,
    userId: userId,
    statusText: statusText
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      params.lat = lat;
      params.lng = lng;
      callBack(params);
    });
  } else {
    callBack(params);
    console.log('device does not have geolocation');
  }
}

var chooseImage = document.getElementById('file-field');
chooseImage.addEventListener("change", function() {
  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    createImgPreview(file);
  }
});

},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3,"../common_modules/_loading":4,"../common_modules/_storage":6,"./_imgur_upload":7}],2:[function(require,module,exports){
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

    var clientId = '98b75d371535f10';
    anHttpRequest.setRequestHeader('Authorization', 'Client-ID ' + clientId)

    anHttpRequest.send(fd);
  };

}

// Export the HttpClient module
exports.HttpClient = HttpClient;
},{}],4:[function(require,module,exports){
var toggleClass = require('../common_modules/_modify_classes').toggleClass;
var addClass = require('../common_modules/_modify_classes').addClass;
var removeClass = require('../common_modules/_modify_classes').removeClass;

var toggleLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  toggleClass(contentLoading, 'loading-done');
  toggleClass(loadingPane, 'loading-done');
};

var showLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  removeClass(contentLoading, 'loading-done');
  removeClass(loadingPane, 'loading-done');
};

var doneLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  addClass(contentLoading, 'loading-done');
  addClass(loadingPane, 'loading-done');
};

var checkLoaded = function() {
  // pass a list of booleans to this function that represent states changing in loading process
  var params = Array.prototype.slice.call(arguments);

  if (params.every(checkTrue)) {
    doneLoading();
  } else {
    showLoading();
  }

  function checkTrue(value) {
    if (value) {
      return true;
    } else {
      return false;
    }
  }
};

exports.toggleLoading = toggleLoading;
exports.showLoading = showLoading;
exports.doneLoading = doneLoading;
exports.checkLoaded = checkLoaded;
},{"../common_modules/_modify_classes":5}],5:[function(require,module,exports){
var hasClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');

  // chack the class isn't on the node already
  if (nodeClassNames.indexOf(className) == -1) {
    return false;
  } else {
    return true;
  }
};

var addClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');

  // chack the class isn't on the node already
  if (!hasClass(node, className)) {
    var newClassNames = nodeClassNames.join(' ').concat(' ', className);
    node.className = newClassNames.trim();
  }

  return node;
};

var removeClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');
  var newClasses = [];

  for (var j = 0; j < nodeClassNames.length; j++) {
    if (nodeClassNames[j] !== className) {
      newClasses.push(nodeClassNames[j]);
    }
  }

  var newClassNames = newClasses.join(' ');
  node.className = newClassNames.trim();

  return node;
};

var toggleClass = function(node, className) {

  // the node had the class already
  if (hasClass(node, className)) {
    removeClass(node, className);
  } else {
    // the node doesn't have the class
    addClass(node, className);
  }

  return node;
};

var findAncestor = function (el, cls) {
  while (!el.classList.contains(cls)) {
    el = el.parentElement;
  };
  return el;
}

// Export the HttpClient module
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.findAncestor = findAncestor;
},{}],6:[function(require,module,exports){
// Feature test for storage
var hasStorage = function() {
  try {
    var mod = 'europe2015';
    localStorage.setItem(mod, mod);
    localStorage.removeItem();
    return true;
  } catch (exception) {
    return false;
  }
};

exports.hasStorage = hasStorage;
},{}],7:[function(require,module,exports){
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allows picture upload to Imgur
var uploadToImgur = function(ownerId, statusId, geolocationId, timeNowMs) {
  console.log('uploading...');

  var form3 = document.getElementById('file-field');
  var files = form3.files;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];

    console.log('file', file);

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
