(function() {
  "use strict";

  var BASE_URL = "http://localhost:8080";

  function isHomeRoute(url) {
    return (
      url === "/" ||
      url === "/index.html" ||
      url === BASE_URL + "/" ||
      url === BASE_URL + "/index.html"
    );
  }

  function isBlockedInfoRoute(url) {
    return (
      url === "/blocked" ||
      url === BASE_URL + "/blocked"
    );
  }

  function modifyRequestIfFromLocalhost(clientRequest) {
    var host = clientRequest.headers.host;

    if (host === "localhost:8080") {
      // Handle case when path is an http url
      var url = clientRequest.url;

      if (url.indexOf("/http://") > -1) {
        url = tidyUp(url);
        host = url.replace("http://", "");

        var slashIndex = host.indexOf("/");

        if (slashIndex > 0) {
          host = host.substring(0, slashIndex);
        }

        clientRequest.url = url;
        clientRequest.headers.host = host;
      }
    }
  }

  function tidyUp(url) {
    if (url.indexOf("/") === 0) {
      url = url.substring(1);
    }
    return url;
  }

  module.exports = {
    isHomeRoute: isHomeRoute,
    isBlockedInfoRoute: isBlockedInfoRoute,
    modifyRequestIfFromLocalhost: modifyRequestIfFromLocalhost
  };

}());
