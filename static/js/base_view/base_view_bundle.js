(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var toggleClass = require('../common_modules/_modify_classes').toggleClass;
var findAncestor = require('../common_modules/_modify_classes').findAncestor;
var logoutUser = require('../common_modules/_auth').logoutUser;

// Adding clickable links to all elements under the nav-pane
var menuIcon = document.getElementById('menu-icon');

menuIcon.addEventListener('click', function(event) {
  var navPane = document.getElementsByClassName('nav-pane')[0];
  toggleClass(navPane, 'active');
});

function logoutMessage() {
  alert("You're credentials have been removed from the browser.");
}

// adding navigation via the href property on elements in the nac-pane class
var navPane = document.getElementsByClassName('nav-pane')[0];

navPane.addEventListener('click', function(event) {
  var elementId = event.target.getAttribute('id');
  if (elementId === 'logout') {
    logoutUser(logoutMessage);
  } else {
    var href = event.target.getAttribute('href');
    if (href !== null) {
      window.location.href = href;
    }
  }
});

// preventing bounce on mobile scrolling
var selScrollable = '.scrollable';

// Uses document because document will be topmost level in bubbling
document.addEventListener('touchmove',function(e){
  e.preventDefault();
});

// Uses body because jQuery on events are called off of the element they are
// added to, so bubbling would not work if we used document instead.
document.getElementsByTagName('body')[0].addEventListener('touchstart', function(e) {
  if (findAncestor(e.target, selScrollable)) {
    if (e.currentTarget.scrollTop === 0) {
      e.currentTarget.scrollTop = 1;
    } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
      e.currentTarget.scrollTop -= 1;
    }
  }
});

// Stops preventDefault from being called on document if it sees a scrollable div
document.getElementsByTagName('body')[0].addEventListener('touchmove', function(e) {
  if (findAncestor(e.target, selScrollable)) {
    e.stopPropagation();
  }
});
},{"../common_modules/_auth":3,"../common_modules/_modify_classes":6}],2:[function(require,module,exports){
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

},{"../common_modules/_loading":5,"./_allowed_urls":2,"./_http_client":4}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"../common_modules/_modify_classes":6}],6:[function(require,module,exports){
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
},{}]},{},[1]);
