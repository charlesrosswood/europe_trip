var imgThumbnails = document.getElementsByClassName('thumbnail');
var imgPreview = document.getElementById('img-preview');

console.log(imgThumbnails);

var setImgPreview = function() {
  var imgSrc = this.getAttribute('src');
  imgPreview.setAttribute('src', imgSrc);
}

for (var i = 0; i < imgThumbnails.length; i++) {
  imgThumbnails[i].addEventListener('click', setImgPreview, false);
}