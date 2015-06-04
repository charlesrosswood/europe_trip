// Adding clickable links to all elements under the nav-pane
var navPane = document.getElementsByClassName('nav-pane')[0];

navPane.addEventListener('click', function(event) {

  var target = event.target;
  var targetClasses = target.className.split(' ');

  // if we're a nav menu and not the phone menu button
  if (targetClasses.indexOf('nav-item' > -1) && targetClasses.indexOf('menu') == -1) {
    window.location.href = target.getAttribute('href');
  } else if (targetClasses.indexOf('nav-item') > -1 && targetClasses.indexOf('menu') > -1) {
    // if the phone menu hasn't been activated, add the active class
    var navItems = document.getElementsByClassName('nav-item');

    for (var i = 0; i < navItems.length; i++) {
      var navItem = navItems[i];
      var navClassNames = navItem.className.split(' ');
      if (navClassNames.indexOf('menu') == -1 && navClassNames.indexOf('active') == -1) {
        navItem.className = navClassNames.join(' ') + ' active';
      } else if (navClassNames.indexOf('menu') == -1 && navClassNames.indexOf('active') > -1) {
        var newClasses = [];
        for (var j = 0; j < navClassNames.length; j++) {
          console.log(navClassNames[j]);
          if (navClassNames[j] !== 'active') {
            newClasses.push(navClassNames[j]);
          }
        }

        navItem.className = newClasses.join(' ');
      }
    }

  }
});
