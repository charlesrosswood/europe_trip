var uploadPostToServer = require('./_post_upload').uploadPostToServer;
var hasStorage = require('../common_modules/_storage').hasStorage;


function uploadFromLocalStorage () {

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
  for (var postKey in savedPosts) {
    if (object.hasOwnProperty(postKey)) {
      viewSavedContainer.appendChild(buildPostForm(savedPosts[postKey]));
    }
  }
}

function buildPostForm(params) {
  // TODO: build a form here! Make sure it fits the form needed in uploadPostToServer!
}

buildSavedPostForms();