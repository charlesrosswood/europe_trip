var HttpClient = function() {

  function buildFormData(jsonObj) {
    var encodedData = '';
    var encodedPairs = [];

    for (var key in jsonObj) {
      var value = jsonObj[key];
      encodedPairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }

    // replace spaces with pluses
    encodedData = encodedPairs.join('&').replace(/%20/g, '+');
    return encodedData;
  }

  this.get = function(aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open( "GET", aUrl, true );

    anHttpRequest.setRequestHeader('Connection', 'close');

    anHttpRequest.send( null );
  }

  this.post = function(aUrl, bodyData, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    }

    anHttpRequest.open( "POST", aUrl, true );

    //anHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    anHttpRequest.setRequestHeader('Content-type', 'application/json; charset=utf-8');

    anHttpRequest.send(JSON.stringify(bodyData));
  }
}

// Export the HttpClient module
exports.HttpClient = HttpClient;