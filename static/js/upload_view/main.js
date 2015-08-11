var uploadPostToServer = require('./_post_upload').uploadPostToServer;
var createImgPreview = require('./_post_upload').createImgPreview;
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var checkLoaded = require('../common_modules/_loading').checkLoaded;
var hasStorage = require('../common_modules/_storage').hasStorage;

// Add all listeners down here
var uploadPost = document.getElementById('upload-photo');
var savePost = document.getElementById('save-button');

// Saving the post to localStorage for offline use
savePost.addEventListener('click', function() {
  showLoading();
  var form = document.getElementById('file-field');
  getPostData(form, savePostToLocalStorage);
});

// Uploading the post to the server
uploadPost.addEventListener('submit', function() {
  showLoading();
  var form = document.getElementById('file-field');
  getPostData(form, uploadPostToServer);
});

function savePostToLocalStorage(params) {
  console.log('params', params);
  if (hasStorage) {
    if (params.files) {
      delete params['files'];
    }
    var localStorageKey = 'post_'.concat(params.postTimestamp);
    localStorage.setItem(localStorageKey, JSON.stringify(params));
    doneLoading();
    var noImgsSaved = "I've saved all the data I could. I can't save images, " +
      "I've saved the names. You'll need to reselect them when you upload later!"
    alert(noImgsSaved);
  } else {
    doneLoading();
    alert('Could not find local storage for offline storage.');
  }
}

function getPostData(form, callBack) {
  // getting current timestamp with timezone
  var timeNow = new Date();
  var timeNowMs = timeNow.getTime()

  var lat = null;
  var lng = null;

  var statusDiv = document.getElementById('status-text');
  var statusText = statusDiv.value;
  if (statusText == '') {
    statusText = null;
  }
  var params = {
    postTimestamp: timeNowMs,
    lat: lat,
    lng: lng,
    statusText: statusText
  };

  var filenameList = [];
  if (form.files.length) {
    for (var i = 0; i < form.files.length; i++) {
      var file = form.files[i];
      filenameList.push(file.name);
    }
    params.fileNames = filenameList;
    params.files = form.files;
  }

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
