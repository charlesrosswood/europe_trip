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
