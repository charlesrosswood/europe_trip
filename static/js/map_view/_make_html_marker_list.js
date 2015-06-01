var buildHtmlList = function(lookupList, marker, place) {

  // TODO: is this necessary with the check down lower?
  if (typeof place === 'undefined') {
    place = null;
  }

  var outerList = document.getElementById('chosen-places-list');
  var innerListElement = document.createElement('div');

  if (lookupList.length % 2 == 0) {
    innerListElement.className = 'background-color-1a color-6';
  } else {
    innerListElement.className = 'background-color-2a color-6';
  }

  innerListElement.id = 'chosen-place';
  innerListElement.setAttribute('data-marker-id', marker.id);

  // make these list elements draggable
  innerListElement.setAttribute('draggable', true);

  var paragraphElement = document.createElement('p');
  var innerHtmlText = 'Marker ' + marker.id;

  // if we have a google place, lets use its address in the label
  if (place != null) {
    innerHtmlText = innerHtmlText + ' (' + place.formatted_address + ')';
  }

  paragraphElement.innerHTML = innerHtmlText;

  innerListElement.appendChild(paragraphElement);
  outerList.appendChild(innerListElement);
}

exports.buildHtmlList = buildHtmlList;