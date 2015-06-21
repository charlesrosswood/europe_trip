var addClass = require('../common_modules/_modify_classes').addClass;

var buildPostcard = function(bigPostcardNode, post) {
  var nodesToDelete = [];
  // remove all the previous children nodes
  for (var i = 0; i < bigPostcardNode.children.length; i++) {
    var childNode = bigPostcardNode.children[i];
    if (!childNode.classList.contains('close-icon')) {
      nodesToDelete.push(childNode);
    }
  }

  for (var i = 0; i < nodesToDelete.length; i++) {
    var childNode = nodesToDelete[i];
    bigPostcardNode.removeChild(childNode);
  }

  // create all the status text node for the postcard
  var statusDiv = document.createElement('div');
  var statusText = document.createTextNode(post.status_entry);
  statusDiv.appendChild(statusText);

  // creating the thumbnail filmstrip
  var thumbnailStrip = document.createElement('div');
  addClass(thumbnailStrip, 'thumbnail-filmstrip');

  // creating thumbnails
  var thumbnails = [];

  // TODO: for (var i=0; i < post.image_urls.length; i++)
  if (post.image_url) {
    var thumbnail = document.createElement('IMG');
    thumbnail.setAttribute('src', post.image_url);
    addClass(thumbnail, 'thumbnail');
    thumbnails.push(thumbnail);
  }

  // adding all the thumbnails to the filmstrip
  for (var i = 0 ; i < thumbnails.length; i++) {
    thumbnailStrip.appendChild(thumbnails[i]);
  }

  var miniMapContainer = null;
  if (post.latitude != null && post.longitude != null) {
    miniMapContainer = buildMiniMap(post);
  }
  console.log(post);

  bigPostcardNode.appendChild(statusDiv);
  if (miniMapContainer) {
    bigPostcardNode.appendChild(miniMapContainer);
  }
  bigPostcardNode.appendChild(thumbnailStrip);

  // for some reason Google maps cannot handle a div that transitions, so refresh it at the end
  refreshMiniMap(post);
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

  return miniMapContainer;

}


function refreshMiniMap(post) {
  google.maps.event.trigger(miniGoogleMap, 'resize');

  var postLocation = new google.maps.LatLng(post.latitude, post.longitude);
  miniGoogleMap.setCenter(postLocation);
}


// export module public APIs here
exports.buildPostcard = buildPostcard;