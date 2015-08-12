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