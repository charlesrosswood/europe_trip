var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var toggleClass = require('../common_modules/_modify_classes').toggleClass;
var findAncestor = require('../common_modules/_modify_classes').findAncestor;
var buildPostcard = require('./_build_postcard').buildPostcard;

var chosenPlaces = [];  // TODO: pointless?
var lookup = [];
var markers = [];
var posts = {};

var postcardContainer = document.getElementById('postcard-container');

function getNewUserPosts() {
  var aClient = new HttpClient();
  var url = endPoints.getUpdatedPosts.url;

  aClient.get(url, function(response, status) {
    if (status == 200) {
      var userPosts = JSON.parse(response);
      // making the posts as a list
      for (var i = 0; i < userPosts.users.length; i++) {
        var user = userPosts.users[i];
        var usersPosts = user.posts;
        for (var j = 0; j < usersPosts.length; j++) {
          var post = usersPosts[j];
          posts[post.id] = post;
        }
      }

      initialiseGMaps(userPosts);
    } else {
      // TODO: render error
    }
  });

}

function addHexColor(c1, c2) {
  var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  while (hexStr.length < 6) { hexStr = '0' + hexStr; } // Zero pad.
  return hexStr;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function initialiseGMaps(userPosts) {
  var mapOptions = {
    center: {lat: 48.8534100, lng: 2.3488000},
    zoom: 5
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  var bounds = new google.maps.LatLngBounds();

  var allUserPaths = [];

  //  for every user
  for (var i = 0; i < userPosts.users.length; i++) {
    var user = userPosts.users[i];

    // for every post by that user
    var routeHistory = [];

    for (var j = 0; j < user.posts.length; j++) {
      var post = user.posts[j];

      if (post.latitude != null && post.longitude != null) {
        var pinIcon = new google.maps.MarkerImage(
          user.avatar_url,
          null, /* size is determined at runtime */
          null, /* origin is 0,0 */
          null, /* anchor is bottom center of the scaled image */
          new google.maps.Size(42, 42)
        );

        // Adding the pin location to a list that will allow a path to be drawn between them, one
        // for each user
        var pinLocation = new google.maps.LatLng(post.latitude, post.longitude);
        routeHistory.push(pinLocation);

        var marker = new google.maps.Marker({
          position: pinLocation,
          map: map,
          title: user.name,
          id: post.id,
        });

        marker.setIcon(pinIcon);

        google.maps.event.addListener(marker, 'click', function(id) {
          return function() {
            toggleClass(bigPostcardNode, 'fade-in');
            toggleClass(bigPostcardNode, 'active');
            var post = posts[id];
            buildPostcard(bigPostcardNode, post);
//            var postcardNode = document.querySelectorAll('[data-postcard-id="' + id + '"]')[0];
//            var postcardBounds = postcardNode.getBoundingClientRect();
//            console.log(postcardBounds.left, postcardContainer.scrollLeft);
//            postcardContainer.scrollLeft = postcardBounds.left;
          }
        }(marker.id));
        // to bind the map to the markers
        bounds.extend(marker.getPosition());
      }
    }
    allUserPaths.push(routeHistory);

  }

  // making the path between all the pins
  for (var i = 0; i < allUserPaths.length; i++) {
      // TODO: CRW - this should be a list of colours - FIX!
    var colour;
    if (i == 0) {
      colour = '#040A0D';
    } else {
      colour = '#F2867A';
    }

    var path = new google.maps.Polyline({
      path: allUserPaths[i],
      geodesic: true,
      strokeColor: colour,
      strokeOpacity: 1.0,
      strokeWight: 2
    });

    path.setMap(map);
  }

  map.fitBounds(bounds);

  doneLoading();
}

showLoading();

// Add all listeners down here
google.maps.event.addDomListener(window, 'load', getNewUserPosts);

var contentLoading = document.getElementById('content-loading');
var bigPostcardNode = document.getElementsByClassName('big-postcard')[0];
var postcards = document.getElementsByClassName('postcard');

for (var i = 0; i < postcards.length; i++) {
  var postcard = postcards[i];
  postcard.addEventListener('click', function(event) {
    var postcardNode = findAncestor(event.target, 'postcard');

    var postcardId = parseInt(postcardNode.getAttribute('data-postcard-id'));
    // TODO: do something, pop up big postcard

    toggleClass(bigPostcardNode, 'fade-in');
    toggleClass(bigPostcardNode, 'active');

    // construct the post card to show
    var post = posts[postcardId];
    buildPostcard(bigPostcardNode, post);

    // use this line if you want to kill the distracting background
//    toggleClass(contentLoading, 'fade-in');
//    toggleClass(contentLoading, 'loading-done');
  });
}

var closeIcon = document.getElementsByClassName('close-icon')[0];
closeIcon.addEventListener('click', function() {
  toggleClass(bigPostcardNode, 'active');
  toggleClass(bigPostcardNode, 'fade-in');

//  toggleClass(contentLoading, 'loading-done');
//  toggleClass(contentLoading, 'fade-in');
});

//postcardContainer.addEventListener('click', function(event) {
//  var postcardId = event.target.getAttribute('data-postcard-id');
//  if (postcardId !== null) {
////    TODO: do something, pop up big postcard
//    var that = null;
//  }
//});






//var leftCarouselArrow = document.getElementById('left-arrow');
//leftCarouselArrow.addEventListener('click', function() {
//  // TODO: CRW - add a translate property to the size of a postcard left
//});
//
//var rightCarouselArrow = document.getElementById('right-arrow');
//rightCarouselArrow.addEventListener('click', function() {
//  // TODO: CRW - add a translate property to the size of a postcard right
//});
//
