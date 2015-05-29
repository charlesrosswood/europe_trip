var markerListener = function(markers, drawingManager) {

  google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {

    markers.push(marker);
    console.log(markers);
    google.maps.event.addListener(marker, 'dragend', function() {
      var objLatLng = marker.getPosition();
      console.log(objLatLng);
    });

    google.maps.event.addListener(marker, 'click', function() {

    });
  });

}

exports.markerListener = markerListener;