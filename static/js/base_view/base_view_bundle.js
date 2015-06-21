(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var toggleClass = require('../common_modules/_modify_classes').toggleClass;

// Adding clickable links to all elements under the nav-pane
var menuIcon = document.getElementById('menu-icon');

menuIcon.addEventListener('click', function(event) {
  var navPane = document.getElementsByClassName('nav-pane')[0];

  toggleClass(navPane, 'active');

});

// adding navigation via the href property on elements in the nac-pane class
var navPane = document.getElementsByClassName('nav-pane')[0];

navPane.addEventListener('click', function(target) {
  var href = event.target.getAttribute('href');
  if (href !== null) {
    window.location.href = href;
  }
});
},{"../common_modules/_modify_classes":2}],2:[function(require,module,exports){
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
