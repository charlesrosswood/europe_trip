var buildHtmlList = require('./_make_html_marker_list').buildHtmlList;

var searchBoxListener = function(searchBox, chosenPlaces, lookup, map, markers) {

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    var place = places[0];

    console.log(place);

    if (places.length == 0) {
      return;
    } else if (places.length == 1 && lookup.indexOf(place.id) == -1) {
      chosenPlaces.push(place);  // TODO: pointless?

      // making google maps marker
      var marker = new google.maps.Marker({
        map: map,
        // icon: image,
        draggable: true,
        title: place.name,
        position: place.geometry.location,
        id: markers.length + 1
      });

      markers.push(marker);
      lookup.push(marker.id);

      // Build HTML list at the bottom of the page
      buildHtmlList(lookup, marker, place);
    } else {
      console.log('select one location not already selected');
    }

    console.log(markers);
  });

}

exports.searchBoxListener = searchBoxListener;