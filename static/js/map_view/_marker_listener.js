var buildHtmlList = require('./_make_html_marker_list').buildHtmlList;

var markerListener = function(markers, drawingManager, lookupList) {

  google.maps.event.addListener(drawingManager, 'markercomplete', function(marker) {

    marker.set("id", markers.length + 1);

    lookupList.push(marker.id);
    markers.push(marker);

    google.maps.event.addListener(marker, 'dragend', function() {
      var objLatLng = marker.getPosition();
      console.log(objLatLng);
    });

    google.maps.event.addListener(marker, 'click', function() {
      // insert select function here, to enable delete
    });

    // build the HTML list at the bottom of the page
    buildHtmlList(lookupList, marker);
  });

}

exports.markerListener = markerListener;