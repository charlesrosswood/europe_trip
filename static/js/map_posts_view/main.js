var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;

var chosenPlaces = [];  // TODO: pointless?
var lookup = [];
var markers = [];

var postcardContainer = document.getElementById('postcard-container');

function getNewUserPosts() {
  var aClient = new HttpClient();
  var url = endPoints.getUpdatedPosts.url;

  aClient.get(url, function(response, status) {
    if (status == 200) {
      var userPosts = JSON.parse(response);

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
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

  var searchBox = new google.maps.places.SearchBox(input); // turn the HTML input into places search

  console.log(userPosts);

  var bounds = new google.maps.LatLngBounds();

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
          title: user.name,
          id: post.id
        });

        google.maps.event.addListener(marker, 'click', function(id) {
          return function() {
            console.log('[data-postcard-id="' + id + '"]');
            var postcardNode = document.querySelectorAll('[data-postcard-id="' + id + '"]')[0];
            console.log(postcardNode);
            var postcardBounds = postcardNode.getBoundingClientRect();
            console.log(postcardBounds);
            postcardContainer.scrollLeft = postcardBounds.left - postcardContainer.scrollLeft;
          }
        }(marker.id));
        // to bind the map to the markers
        bounds.extend(marker.getPosition());
      }
    }

  map.fitBounds(bounds);

  doneLoading();
}

showLoading();

// Add all listeners down here
google.maps.event.addDomListener(window, 'load', getNewUserPosts);


postcardContainer.addEventListener('click', function(event) {
  var postcardId = event.target.getAttribute('data-postcard-id');
  if (postcardId !== null) {
//    TODO: do something, pop up big postcard
    var that = null;
  }
});
