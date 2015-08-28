(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var bigPostcardNode = document.getElementById('big-postcard');
var postcards = document.getElementsByClassName('postcard');
var bigPictureNode = document.getElementById('big-picture');

for (var i = 0; i < postcards.length; i++) {
  var postcard = postcards[i];
  postcard.addEventListener('click', function(event) {
    var postcardNode = findAncestor(event.target, 'postcard');

    var postcardId = parseInt(postcardNode.getAttribute('data-postcard-id'));
    bigPostcardNode.setAttribute('data-postcard-id', postcardId);

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

var postcardCloseIcon = document.getElementById('postcard-close-icon');
postcardCloseIcon.addEventListener('click', function() {
  toggleClass(bigPostcardNode, 'active');
  toggleClass(bigPostcardNode, 'fade-in');
});

var pictureCloseIcon = document.getElementById('picture-close-icon');
pictureCloseIcon.addEventListener('click', function() {
  toggleClass(bigPictureNode, 'active');
  toggleClass(bigPictureNode, 'fade-in');
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

},{"../common_modules/_allowed_urls":2,"../common_modules/_http_client":5,"../common_modules/_loading":6,"../common_modules/_modify_classes":7,"./_build_postcard":8}],2:[function(require,module,exports){
var endPoints = (function() {
  return {

//    saveRoute: {
//      url: 'save-route',
//      methods: ['POST']
//    },

    getUpdatedPosts: {
      url: 'get-updated-posts',
      methods: ['GET']
    },

//    upload: {
//      url: 'upload',
//      methods: ['GET', 'POST']
//    },

//    map: {
//      url: 'map',
//      methods: ['GET']
//    },

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

    updateTable: function(tablename) {
      return {
        url: 'update/' + tablename,
        methods: ['PUT']
      };
    },

    getAuthKey: {
      url: 'authorise',
      methods: ['POST']
    },

  };
})();  // Note the closure :)

// Export the endPoints module
exports.endPoints = endPoints;
},{}],3:[function(require,module,exports){
var HttpClient = require('./_http_client').HttpClient;
var endPoints = require('./_allowed_urls').endPoints;
var doneLoading = require('../common_modules/_loading').doneLoading;

function hasAuthKey() {
  for (var key in localStorage) {
    if (key === 'auth_token') {
      return true;
    }
  }
  return false;
}

function deleteAuthKey() {
  localStorage.removeItem('auth_token');
}

function deleteUserId() {
  localStorage.removeItem('user_id');
}

function getAuthKey() {
  return localStorage.getItem('auth_token');
}

function getUserId() {
  return localStorage.getItem('user_id');
}

function saveNewAuthKey(authKey) {
  localStorage.setItem('auth_token', authKey);
}

function saveUserId(userId) {
  localStorage.setItem('user_id', userId);
}

function savePassword(username, password, callBack, params) {
  var aClient = new HttpClient();
  var authUrl = endPoints.getAuthKey.url;

  var bodyData = {
    'username': username,
    'password': password
  };

  aClient.post(authUrl, bodyData, function(response, status) {
    if (status == 200) {
      var response = JSON.parse(response);
      saveNewAuthKey(response.auth_token);
      saveUserId(parseInt(response.user_id));
      callBack(params, {
          authToken: getAuthKey(),
          userId: getUserId()
      });
    } else {
      alert('Authorisation failed.');
      doneLoading();
    }
  });
}

var logoutUser = function(callBack) {
  deleteAuthKey();
  deleteUserId();
  callBack();
}

var fetchUserAuth = function(params, callBack) {
  if (hasAuthKey()) {
    callBack(params, {
      authToken: getAuthKey(),
      userId: getUserId()
    });
  } else {
    var username = prompt('Enter your username');
    var password = prompt('Enter your password');
    savePassword(username, password, callBack, params);
  }
};

exports.fetchUserAuth = fetchUserAuth;
exports.logoutUser = logoutUser;

},{"../common_modules/_loading":6,"./_allowed_urls":2,"./_http_client":5}],4:[function(require,module,exports){
var removeContents = function(node) {
  var nodesToDelete = [];
  // remove all the previous children nodes
  for (var i = 0; i < node.children.length; i++) {
    var childNode = node.children[i];
    if (!childNode.classList.contains('close-icon')) {
      nodesToDelete.push(childNode);
    }
  }

  for (var i = 0; i < nodesToDelete.length; i++) {
    var childNode = nodesToDelete[i];
    node.removeChild(childNode);
  }
}

var createNodeWithContent = function(nodeType, text) {
  const node = document.createElement(nodeType);

  if (text !== null) {
    const nodeText = document.createTextNode(text);
    node.appendChild(nodeText);
  }

  return node;
}

var createNodeWithText = function(nodeType, text, label) {
  // Create a container for the rendered form elements
  const containerNode = document.createElement('div');
  class_operations.addClass(containerNode, 'form-element-container');

  // If there's no label, don't render one
  if (label) {
    const labelNode = document.createElement('div');
    class_operations.addClass(labelNode, 'label');
    const labelText = document.createTextNode(label);
    labelNode.appendChild(labelText);

    containerNode.appendChild(labelNode);
  }

  const node = createNodeWithContent(nodeType, text);
  class_operations.addClass(node, 'form-value');

  // Special for 'general comment' search box node
  if (nodeType === 'input') {
    const generalCommentContainer = document.createElement('div');
    class_operations.addClass(generalCommentContainer, 'general-comment-container');

    generalCommentContainer.appendChild(node);
    containerNode.appendChild(generalCommentContainer);
  } else {
    containerNode.appendChild(node);
  }

  if (nodeType === 'select' || nodeType === 'input') {
    return {
      container: containerNode,
      innerNode: node
    };
  }
  return containerNode;
}

exports.removeContents = removeContents;
exports.createNodeWithContent = createNodeWithContent;
exports.createNodeWithText = createNodeWithText;
},{}],5:[function(require,module,exports){
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

  this.put = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4) {
        aCallback(anHttpRequest.responseText, anHttpRequest.status);
      }
    }

    anHttpRequest.open( "PUT", aUrl, true );

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

    var clientId = '98b75d371535f10';
    anHttpRequest.setRequestHeader('Authorization', 'Client-ID ' + clientId)

    anHttpRequest.send(fd);
  };

}

// Export the HttpClient module
exports.HttpClient = HttpClient;
},{}],6:[function(require,module,exports){
var toggleClass = require('../common_modules/_modify_classes').toggleClass;
var addClass = require('../common_modules/_modify_classes').addClass;
var removeClass = require('../common_modules/_modify_classes').removeClass;

var toggleLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  toggleClass(contentLoading, 'loading-done');
  toggleClass(loadingPane, 'loading-done');
};

var showLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  removeClass(contentLoading, 'loading-done');
  removeClass(loadingPane, 'loading-done');
};

var doneLoading = function() {
  var loadingPane = document.getElementById('loading-pane');
  var contentLoading = document.getElementById('content-loading');

  addClass(contentLoading, 'loading-done');
  addClass(loadingPane, 'loading-done');
};

var checkLoaded = function() {
  // pass a list of booleans to this function that represent states changing in loading process
  var params = Array.prototype.slice.call(arguments);

  if (params.every(checkTrue)) {
    doneLoading();
  } else {
    showLoading();
  }

  function checkTrue(value) {
    if (value) {
      return true;
    } else {
      return false;
    }
  }
};

exports.toggleLoading = toggleLoading;
exports.showLoading = showLoading;
exports.doneLoading = doneLoading;
exports.checkLoaded = checkLoaded;
},{"../common_modules/_modify_classes":7}],7:[function(require,module,exports){
var hasClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');

  // chack the class isn't on the node already
  if (nodeClassNames.indexOf(className) == -1) {
    return false;
  } else {
    return true;
  }
};

var addClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');

  // chack the class isn't on the node already
  if (!hasClass(node, className)) {
    var newClassNames = nodeClassNames.join(' ').concat(' ', className);
    node.className = newClassNames.trim();
  }

  return node;
};

var removeClass = function(node, className) {
  var nodeClassNames = node.className.split(' ');
  var newClasses = [];

  for (var j = 0; j < nodeClassNames.length; j++) {
    if (nodeClassNames[j] !== className) {
      newClasses.push(nodeClassNames[j]);
    }
  }

  var newClassNames = newClasses.join(' ');
  node.className = newClassNames.trim();

  return node;
};

var toggleClass = function(node, className) {

  // the node had the class already
  if (hasClass(node, className)) {
    removeClass(node, className);
  } else {
    // the node doesn't have the class
    addClass(node, className);
  }

  return node;
};

var findAncestor = function (el, cls) {
  while (!el.classList.contains(cls)) {
    // If we reach the body node then fail
    if (el.nodeName.toLowerCase() === 'body') {
      return null;
    }
    el = el.parentElement;
  };
  return el;
}

// Export the HttpClient module
exports.hasClass = hasClass;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.findAncestor = findAncestor;
},{}],8:[function(require,module,exports){
var addClass = require('../common_modules/_modify_classes').addClass;
var removeContents = require('../common_modules/_dom_manipulation').removeContents;
var createNodeWithContent = require('../common_modules/_dom_manipulation').createNodeWithContent;
var showLoading = require('../common_modules/_loading').showLoading;
var doneLoading = require('../common_modules/_loading').doneLoading;
var HttpClient = require('../common_modules/_http_client').HttpClient;
var endPoints = require('../common_modules/_allowed_urls').endPoints;
var fetchUserAuth = require('../common_modules/_auth').fetchUserAuth;

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

  var uploadContainer = createNodeWithContent('div', 'Add more images');
  uploadContainer.appendChild(document.createElement('br'));
  addClass(uploadContainer, 'upload-container');

  var imageUploadNode = document.createElement('input');
  imageUploadNode.type = 'file';
  imageUploadNode.setAttribute('multiple', 'true');
  imageUploadNode.setAttribute('id', 'add-photos');
  uploadContainer.appendChild(imageUploadNode);

  var uploadButton = document.createElement('input');
  uploadButton.type = 'button';
  uploadButton.setAttribute('value', 'Upload');
  uploadButton.setAttribute('id', 'upload-button');
  uploadContainer.appendChild(uploadButton);

  bigPostcardNode.appendChild(uploadContainer);

  uploadButton.addEventListener('click', function() {
    var imagesToUpload = document.getElementById('add-photos').files;
    var params = {
      files: imagesToUpload,
      postId: parseInt(bigPostcardNode.getAttribute('data-postcard-id'))
    };

    console.log(params);

    fetchUserAuth(params, updateWithImages);
  });

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

function updateWithImages(params, userData) {
  if (params.files && (params.files.length > 0)) {
    for (var i = 0; i < params.files.length; i++) {
      showLoading();
      var file = params.files[i];

      var cClient = new HttpClient();

      cClient.postImgur(file, function(cResponse, cStatus) {
        if (cStatus == 200) {
          imgurSuccess = true;
          doneLoading();
          var imgurResponse = JSON.parse(cResponse);
          var imgurUrl = imgurResponse.data.link;
          var imgurDeleteHash = imgurResponse.data.deletehash;

          showLoading();
          var dBodyData = {
            columns: ['post_id', 'image_url', 'image_deletehash'] ,
            values: [[parseInt(params.postId), imgurUrl, imgurDeleteHash]],
            auth_token: userData.authToken
          };

          var dClient = new HttpClient();
          dClient.post(endPoints.writeTable('images').url, dBodyData, function(dResponse,
          dStatus) {
            if (dStatus == 201) {
              imageSuccess = true;
              doneLoading();
              console.log('we uploaded and updated images!');
              window.location.href = window.location.href;
            } else {
              doneLoading();
              alert('failed to add imgur URL to post');
              console.log(dResponse, dStatus);
            }
          }, function() {
            alert('failed to add imgur URL to post');
            doneLoading();
          });
        }
      });
    }
  }
};

// export module public APIs here
exports.buildPostcard = buildPostcard;

},{"../common_modules/_allowed_urls":2,"../common_modules/_auth":3,"../common_modules/_dom_manipulation":4,"../common_modules/_http_client":5,"../common_modules/_loading":6,"../common_modules/_modify_classes":7}]},{},[1]);
