var addClass = require('../common_modules/_modify_classes').addClass;
var removeContents = require('../common_modules/_dom_manipulation').removeContents;

var buildPostcard = function(bigPostcardNode, post) {
  removeContents(bigPostcardNode);

  // create a posted time div
  var dateDiv = document.createElement('div');
  dateDiv.setAttribute('id', 'post-date');
  var postDate = new Date(post.post_timestamp).toGMTString();
  var dateText = document.createTextNode(postDate);
  dateDiv.appendChild(dateText);

  // create the title div to give the status text a lead in
  var titleDiv = document.createElement('div');
  titleDiv.setAttribute('id', 'title');
  if (post.status_entry === null) {
    post.status_entry = 'Location pin!';
  }
  var title = post.status_entry.substring(0, post.status_entry.lastIndexOf(' ', 25)).concat('...');
  var titleText = document.createTextNode(title);
  titleDiv.appendChild(titleText);

  // create all the status text node for the postcard
  var statusDiv = document.createElement('div');
  statusDiv.setAttribute('id', 'status');
  var statusText = document.createTextNode(post.status_entry);
  statusDiv.appendChild(statusText);

  // creating the thumbnail filmstrip
  var thumbnailStrip = document.createElement('div');
  thumbnailStrip.setAttribute('id', 'thumbnail-filmstrip');
  var thumbnailWrap = document.createElement('div');
  thumbnailWrap.setAttribute('id', 'thumbnail-wrap');
  thumbnailStrip.appendChild(thumbnailWrap);

  // creating thumbnails
  var thumbnails = [];

  // TODO: for (var i=0; i < post.image_urls.length; i++)
  if (post.images) {
    for (var i = 0; i < post.images.length; i++) {
      var thumbnail = document.createElement('IMG');
      thumbnail.setAttribute('src', post.images[i].image_url);
      addClass(thumbnail, 'thumbnail');
      addClass(thumbnail, 'clickable');

      thumbnail.addEventListener('click', function(event) {
        var bigPic = document.getElementById('big-picture');
        removeContents(bigPic);
        addClass(bigPic, 'fade-in');
        addClass(bigPic, 'active');
        var bigImg = document.createElement('IMG');
        bigImg.setAttribute('id', 'big-pic');
        bigImg.setAttribute('src', event.target.getAttribute('src'));
        addClass(bigImg, 'horiz-center');
        addClass(bigImg, 'vert-center');
        bigPic.appendChild(bigImg);
      });

      thumbnails.push(thumbnail);
    }
  }

  // adding all the thumbnails to the filmstrip
  for (var i = 0 ; i < thumbnails.length; i++) {
    thumbnailWrap.appendChild(thumbnails[i]);
  }

  var miniMapContainer = null;
  if (post.latitude != null && post.longitude != null) {
    miniMapContainer = buildMiniMap(post);
  }

  bigPostcardNode.appendChild(titleDiv);
  bigPostcardNode.appendChild(dateDiv);
  bigPostcardNode.appendChild(statusDiv);
  if (miniMapContainer.container) {
    bigPostcardNode.appendChild(miniMapContainer.container);
  }
  bigPostcardNode.appendChild(thumbnailStrip);

  // for some reason Google maps cannot handle a div that transitions, so refresh it at the end
  refreshMiniMap(post, miniMapContainer.miniMap);
};

function buildMiniMap(post) {
  // building the mini-map
  var miniMapContainer = document.createElement('div');
  miniMapContainer.setAttribute('id', 'minimap-container');

  var miniMap = document.createElement('div');
  miniMap.setAttribute('id', 'minimap-canvas');

  miniMapContainer.appendChild(miniMap);

  // building the Google map
  var postLocation = new google.maps.LatLng(post.latitude, post.longitude);
  var mapOptions = {
    center: postLocation,
    zoom: 15
  };

  miniGoogleMap = new google.maps.Map(miniMap, mapOptions);

  // making the marker

  var marker = new google.maps.Marker({
    position: postLocation,
    map: miniGoogleMap,
//    title: user.name,
    id: post.id,
  });

  return {
    container: miniMapContainer,
    miniMap: miniGoogleMap
  };

}

function refreshMiniMap(post, miniMap) {
  google.maps.event.trigger(miniMap, 'resize');

  var postLocation = new google.maps.LatLng(post.latitude, post.longitude);
  miniMap.setCenter(postLocation);
}

// export module public APIs here
exports.buildPostcard = buildPostcard;