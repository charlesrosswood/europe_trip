(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;

var chosenPlaces = [];  // TODO: pointless?
var lookup = [];
var markers = [];

function getNewUserPosts() {
  var aClient = new HttpClient();
  var url = endPoints.getUpdatedPosts.url;

  aClient.get(url, function(response, status) {
    if (status == 200) {
      var userPosts = JSON.parse(response);

      // TODO: render the x-carousel at the bottom of the page with the posts in
      initialiseGMaps(userPosts);
    } else {
      // TODO: render error
    }
  });

}

function initialiseGMaps(userPosts) {
  var mapOptions = {
    center: {lat: 48.8534100, lng: 2.3488000},
    zoom: 5
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var input = document.getElementById('places-input');

  // set the Google maps control array to have the input element at the "TOP_LEFT" value/position
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(input); // turn the HTML input into places search

  console.log(userPosts);
  //  for every user
  for (var i = 0; i < userPosts.users.length; i++) {
    var user = userPosts.users[i];
    var posts = user.posts;

    // for every post by that user
    for (var j = 0; j < posts.length; j++) {
      var post = posts[j];
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(post.latitude, post.longitude),
        map: map,
        title: user.name
      });
    }

  }


}

google.maps.event.addDomListener(window, 'load', getNewUserPosts);

//// Add all listeners down here

},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3}],2:[function(require,module,exports){
var endPoints = (function() {
  return {

    saveRoute: {
      url: 'save-route',
      methods: ['POST']
    },

    getUpdatedPosts: {
      url: 'get-updated-posts',
      methods: ['GET']
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
},{}]},{},[1]);
