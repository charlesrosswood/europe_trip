var buildPostcard = function(bigPostcardNode, post) {
//  while (bigPostcardNode.firstChild) {
//    console.log(bigPostcardNode.firstChild.className);
//    bigPostcardNode.removeChild(bigPostcardNode.firstChild);
//  }

  // create all the nodes for the postcard
  var statusText = document.createTextNode(post.status_entry);

  var photo = document.createElement('IMG');
  photo.setAttribute('src', post.image_url);

  bigPostcardNode.appendChild(statusText);
  bigPostcardNode.appendChild(photo);

};

// export module public APIs here
exports.buildPostcard = buildPostcard;