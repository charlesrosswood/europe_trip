var toggleClass = require('../common_modules/_modify_classes').toggleClass;
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