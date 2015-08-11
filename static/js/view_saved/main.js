var uploadPostToServer = require('../upload_view/_post_upload').uploadPostToServer;
var hasStorage = require('../common_modules/_storage').hasStorage;
var addClass = require('../common_modules/_modify_classes').addClass;
var createNodeWithContent = require('../common_modules/_dom_manipulation').createNodeWithContent;

function refreshMiniMaps(miniMapsObj) {
  for (var i = 0; i < miniMapsObj.length; i++) {
    var miniMap = miniMapsObj[i].miniMap;
    var post = miniMapsObj[i].params;
    google.maps.event.trigger(miniMap, 'resize');
    var postLocation = new google.maps.LatLng(post.lat, post.lng);
    miniMap.setCenter(postLocation);
  }
}

function uploadFromLocalStorage () {
  //TODO: make this upload the data to the server
  var savedPostsNodes = document.getElementsByClassName('saved-post-container');
  var numSavedPosts = savedPostsNodes.length;
  for (var i = 0; i < numSavedPosts; i++) {
    var savedPost = savedPostsNodes[i];
    var postKey = savedPost.getAttribute('id');
    var params = JSON.parse(localStorage.getItem(postKey));
    var postFiles = document.getElementById(postKey.concat('_files')).files;
    params.files = postFiles;
    uploadPostToServer(params);
  }
}

function getAllSavedPosts() {
  var savedPosts = {};
  if (hasStorage) {
    for (var key in localStorage) {
      var isPost = (key.slice(0, 4) == 'post');
      if (isPost) {
         savedPosts[key] = JSON.parse(localStorage.getItem(key));
      }
    }
  }
  return savedPosts;
}

function buildSavedPostForms() {
  var viewSavedContainer = document.getElementById('view-saved');
  var savedPosts = getAllSavedPosts();
  var miniMaps = [];
  for (var postKey in savedPosts) {
    if (savedPosts.hasOwnProperty(postKey)) {
      var params = savedPosts[postKey];
      var savedPostNode = buildPostForm(params, postKey);
      viewSavedContainer.appendChild(savedPostNode.container);
      miniMaps.push({
        miniMap: savedPostNode.miniMap,
        params: params
      });
    }
  }
  refreshMiniMaps(miniMaps);
}

function buildPostForm(params, postKey) {
  // TODO: build a form here! Make sure it fits the form needed in uploadPostToServer!
  var postContainer = document.createElement('div');
  postContainer.setAttribute('id', postKey);
  addClass(postContainer, 'saved-post-container');
  addClass(postContainer, 'horiz-center');

  var dateStr = new Date(params.postTimestamp).toGMTString();
  var dateNode = createNodeWithContent('div', dateStr);
  addClass(dateNode, 'post-date');

  var title = params.statusText.substring(0, params.statusText.lastIndexOf(' ', 25)).concat(
    '...');
  var titleNode = createNodeWithContent('div', title);
  addClass(titleNode, 'post-title');

  var statusTextNode = createNodeWithContent('div', params.statusText);
  addClass(statusTextNode, 'status-text');

  var miniGoogleMap = buildMiniMap(params);
  var miniMapNode = miniGoogleMap.container;

  var imgFileNames = params.fileNames.join(', ');
  var imgFileNamesNode = createNodeWithContent('div', imgFileNames);
  addClass(imgFileNamesNode, 'filenames');

  var fileUploadNode = document.createElement('input');
  fileUploadNode.setAttribute('type', 'file');
  fileUploadNode.setAttribute('name', 'image');
  fileUploadNode.setAttribute('id', postKey.concat('_files'));
  fileUploadNode.setAttribute('multiple', 'true');

  var deletePost = document.createElement('input');
  addClass(deletePost, 'delete-post');
  deletePost.setAttribute('type', 'button');
  deletePost.setAttribute('id', postKey.concat('_delete'));
  deletePost.value = 'Delete'

  postContainer.appendChild(dateNode);
  postContainer.appendChild(titleNode);
  postContainer.appendChild(statusTextNode);
  postContainer.appendChild(miniMapNode);
  postContainer.appendChild(imgFileNamesNode);
  postContainer.appendChild(fileUploadNode);
  postContainer.appendChild(deletePost);
  return {
    container: postContainer,
    miniMap: miniGoogleMap.miniMap
  };
}

function buildMiniMap(params) {
  // building the mini-map
  var miniMapContainer = document.createElement('div');
  addClass(miniMapContainer, 'minimap-container');

  var miniMap = document.createElement('div');
  addClass(miniMap, 'minimap-canvas');

  miniMapContainer.appendChild(miniMap);

  // building the Google map
  var postLocation = new google.maps.LatLng(params.lat, params.lng);
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
    id: new Date(params.postTimestamp).toGMTString(),
  });

  return {
    container: miniMapContainer,
    miniMap: miniGoogleMap
  };

}

buildSavedPostForms();

document.getElementById('upload-button').addEventListener('click', uploadFromLocalStorage);
var deleteButtons = document.getElementsByClassName('delete-post');

for (var i = 0; i < deleteButtons.length; i++) {
  var viewSavedContainer = document.getElementById('view-saved');

  var button = deleteButtons[i];
  button.addEventListener('click', function(event) {
    var postId = event.target.getAttribute('id');
    postId = postId.slice(0, postId.indexOf('_delete'));
    var postContainer = document.getElementById(postId);
    localStorage.removeItem(postId);
    viewSavedContainer.removeChild(postContainer);
  });
}