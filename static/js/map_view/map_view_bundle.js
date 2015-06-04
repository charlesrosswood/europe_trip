(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var searchBoxListener = require('./_places_changed_listener').searchBoxListener;
var markerListener = require('./_marker_listener').markerListener;

var chosenPlaces = [];  // TODO: pointless?
var lookup = [];
var markers = [];

function initialise() {
  var mapOptions = {
    center: {lat: 48.8534100, lng: 2.3488000},
    zoom: 5
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER
      ]
    },
    markerOptions: {
      draggable: true
//      icon: 'images/beachflag.png'
    },
  });

  drawingManager.setMap(map);
  var input = document.getElementById('places-input');

  // set the Google maps control array to have the input element at the "TOP_LEFT" value/position
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(input); // turn the HTML input into places search

  // [START region_getplaces]
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item
  searchBoxListener(searchBox, chosenPlaces, lookup, map, markers);

  markerListener(markers, drawingManager, lookup);

}

google.maps.event.addDomListener(window, 'load', initialise);

function saveRoute() {
  var url = endPoints.saveRoute.url;
  console.log(endPoints.readTable('testing').url);

  var aClient = new HttpClient();
  aClient.post(url, chosenPlaces, function(response) {
    var object = JSON.parse(response);
    console.log(object);
  });

}


// Add all listeners down here
var save_route_button = document.getElementById('save-route-button');
save_route_button.addEventListener("click", saveRoute);

},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":3,"./_marker_listener":5,"./_places_changed_listener":6}],2:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var buildHtmlList = function(lookupList, marker, place) {

  // TODO: is this necessary with the check down lower?
  if (typeof place === 'undefined') {
    place = null;
  }

  var outerList = document.getElementById('chosen-places-list');
  var innerListElement = document.createElement('div');

  if (lookupList.length % 2 == 0) {
    innerListElement.className = 'background-color-1a color-6';
  } else {
    innerListElement.className = 'background-color-2a color-6';
  }

  innerListElement.id = 'chosen-place';
  innerListElement.setAttribute('data-marker-id', marker.id);

  // make these list elements draggable
  innerListElement.setAttribute('draggable', true);

  var paragraphElement = document.createElement('p');
  var innerHtmlText = 'Marker ' + marker.id;

  // if we have a google place, lets use its address in the label
  if (place != null) {
    innerHtmlText = innerHtmlText + ' (' + place.formatted_address + ')';
  }

  paragraphElement.innerHTML = innerHtmlText;

  innerListElement.appendChild(paragraphElement);
  outerList.appendChild(innerListElement);
}

exports.buildHtmlList = buildHtmlList;
},{}],5:[function(require,module,exports){
var buildHtmlList = require('./_make_html_marker_list').buildHtmlList;

var markerListener = function(markers, drawingManager, lookupList) {

  google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {

    marker.set("id", markers.length + 1);

    lookupList.push(marker.id);
    markers.push(marker);

    google.maps.event.addListener(marker, 'dragend', function() {
      var objLatLng = marker.getPosition();
      console.log(objLatLng);
    });

    google.maps.event.addListener(marker, 'click', function() {
      // insert select function here, to enable delete
    });

    // build the HTML list at the bottom of the page
    buildHtmlList(lookupList, marker);
  });

}

exports.markerListener = markerListener;
},{"./_make_html_marker_list":4}],6:[function(require,module,exports){
var buildHtmlList = require('./_make_html_marker_list').buildHtmlList;

var searchBoxListener = function(searchBox, chosenPlaces, lookup, map, markers) {

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    var place = places[0];

    console.log(place);

    if (places.length == 0) {
      return;
    } else if (places.length == 1 && lookup.indexOf(place.id) == -1) {
      chosenPlaces.push(place);  // TODO: pointless?

      // making google maps marker
      var marker = new google.maps.Marker({
        map: map,
        // icon: image,
        draggable: true,
        title: place.name,
        position: place.geometry.location,
        id: markers.length + 1
      });

      markers.push(marker);
      lookup.push(marker.id);

      // Build HTML list at the bottom of the page
      buildHtmlList(lookup, marker, place);
    } else {
      console.log('select one location not already selected');
    }

    console.log(markers);
  });

}

exports.searchBoxListener = searchBoxListener;
},{"./_make_html_marker_list":4}]},{},[1]);
