(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var uploadToImgur = require('./_imgur_upload').uploadToImgur;
var statusUpload = require('./_status_upload').statusUpload;
var createImgPreview = require('./_imgur_upload').createImgPreview;
var geolocationUpload= require('./_geolocation_upload').geolocationUpload;

// Add all listeners down here
var uploadPhoto = document.getElementById('upload-photo');
uploadPhoto.addEventListener("submit", function() {

  var ownerId = document.getElementById('user-details').value;

  console.log(ownerId);
  geolocationUpload(ownerId, function(response) {
    var geolocationId = response.result[0].geolocations_id;

    statusUpload(ownerId, geolocationId, function(response) {
      var response = JSON.parse(response);
      var statusId = response['result'][0]['status_entries_id']
      uploadToImgur(ownerId, statusId, geolocationId);
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

},{"./_geolocation_upload":4,"./_imgur_upload":5,"./_status_upload":6}],2:[function(require,module,exports){
var endPoints = (function() {
  return {

    saveRoute: {
      url: 'save-route',
      methods: ['POST']
    },

    upload: {
      url: 'upload',
      methods: ['GET', 'POST']
    },

    map: {
      url: 'map',
      methods: ['GET']
    },

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
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open( "GET", aUrl, true );

    anHttpRequest.send( null );
  };

  this.post = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open( "POST", aUrl, true );

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
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
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
},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3}],5:[function(require,module,exports){
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

// Allowspicture uplaod to Imgur
var uploadToImgur = function(ownerId, statusId, geolocationId) {
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
        'columns' :['users_id', 'geolocations_id', 'image_url', 'delete_hash', 'status_entries_id'],
        'values': [[ownerId, geolocationId, imgurUrl, imgurDeleteHash, statusId]]
      };

      bClient.post(endPoints.writeTable('photo_uploads').url, tableData, function(response) {
        console.log(response);
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
},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3}],6:[function(require,module,exports){
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
},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3}]},{},[1]);
