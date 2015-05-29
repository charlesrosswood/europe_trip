var searchBoxListener = function(searchBox, chosenPlaces, lookup, map, markers) {

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    var place = places[0];

    console.log(place);

    if (places.length == 0) {
      return;
    } else if (places.length == 1 && lookup.indexOf(place.id) == -1) {
      chosenPlaces.push(place);
      lookup.push(place.id);

      // making google maps marker
      var marker = new google.maps.Marker({
        map: map,
        // icon: image,
        draggable: true,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      var outerList = document.getElementById('chosen-places-list');
      var innerListElement = document.createElement('div');

      if (chosenPlaces.length % 2 == 0) {
        innerListElement.className = "background-color-1a color-6";
      } else {
        innerListElement.className = "background-color-2a color-6";
      }

      innerListElement.id = "chosen-place";

      var paragraphElement = document.createElement('p');
      paragraphElement.innerHTML = place.formatted_address;

      innerListElement.appendChild(paragraphElement);
      outerList.appendChild(innerListElement);

    } else {
      console.log('select one location not already selected');
    }

    console.log(markers);
  });

}

exports.searchBoxListener = searchBoxListener;