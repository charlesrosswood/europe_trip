(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    anHttpRequest.setRequestHeader('Connection', 'close');

    anHttpRequest.send( null );
  }

  this.post = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open( "POST", aUrl, true );

    //anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    anHttpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    anHttpRequest.send(JSON.stringify(bodyData));
  }
}

// Export the HttpClient module
exports.HttpClient = HttpClient;
},{}],2:[function(require,module,exports){
var markerListener = function(markers, drawingManager) {

  google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {

    markers.push(marker);
    console.log(markers);
    google.maps.event.addListener(marker, 'dragend', function() {
      var objLatLng = marker.getPosition();
      console.log(objLatLng);
    });

    google.maps.event.addListener(marker, 'click', function() {

    });
  });

}

exports.markerListener = markerListener;
},{}],3:[function(require,module,exports){
var searchBoxListener = function(searchBox, chosenPlaces, lookup, map, markers) {

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    var place = places[0];

    console.log(place);

    if (places.length == 0) {
      return;
    } else if (places.length == 1 && lookup.indexOf(place.id) == -1) {
      chosenPlaces.push(place);
      lookup.push(place.id);

      // making google maps marker
      var marker = new google.maps.Marker({
        map: map,
        // icon: image,
        draggable: true,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      var outerList = document.getElementById('chosen-places-list');
      var innerListElement = document.createElement('div');

      if (chosenPlaces.length % 2 == 0) {
        innerListElement.className = "background-color-1a color-6";
      } else {
        innerListElement.className = "background-color-2a color-6";
      }

      innerListElement.id = "chosen-place";

      var paragraphElement = document.createElement('p');
      paragraphElement.innerHTML = place.formatted_address;

      innerListElement.appendChild(paragraphElement);
      outerList.appendChild(innerListElement);

    } else {
      console.log('select one location not already selected');
    }

    console.log(markers);
  });

}

exports.searchBoxListener = searchBoxListener;
},{}],4:[function(require,module,exports){
var HttpClient = require('./_http_client').HttpClient;
var searchBoxListener = require('./_places_changed_listener').searchBoxListener;
var markerListener = require('./_marker_listener').markerListener;

var chosenPlaces = [];
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

  markerListener(markers, drawingManager);

}

google.maps.event.addDomListener(window, 'load', initialise);


function saveRoute() {
  var url = 'save-route';

//  var aClient = new HttpClient();
//  aClient.get(url, function(response) {
//    console.log(response);
//    var object = JSON.parse(response);
//    console.log(object);
//  });

  var aClient = new HttpClient();
  aClient.post(url, chosenPlaces, function(response) {
    var object = JSON.parse(response);
    console.log(object);
  });

}
// Add to the chosen-places DOM node

//document.getElementById('places-input').addEventListener('keypress', function(e) {
//  var key = e.which || e.keyCode;
//  if (key === 13) {
//    console.log('enter_pressed!');
//
//  }
//});

},{"./_http_client":1,"./_marker_listener":2,"./_places_changed_listener":3}]},{},[4]);
