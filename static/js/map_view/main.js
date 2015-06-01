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
