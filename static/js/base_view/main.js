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
  window.location.href = event.target.getAttribute('href');
});