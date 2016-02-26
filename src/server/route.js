(function() {
  "use strict";

  var constants = require("./shared/constants");

  var EXTERNAL_INDICATOR = "http://";

  module.exports.isHomeRoute = function(url) {
    return (url === "/" || url === "/index.html");
  };

  module.exports.isBlockedInfoRoute = function(url) {
    return (url === "/blocked");
  };

  // This is necessary for when the tests make requests to the server
  module.exports.modifyRequestIfFromLocalHost = function(request) {
    if (isLocalHost(request.headers.host) && routeIsExternal(request.url)) {
      modifyRequestURL(request);
      modifyRequestHost(request);
    }

    function isLocalHost(host) {
      return host === constants.host + ":" + constants.port;
    }

    function routeIsExternal(url) {
      return url.indexOf(EXTERNAL_INDICATOR) > -1;
    }

    function modifyRequestURL(request) {
      request.url = removeLeadingSlashIfPresent(request.url);

      function removeLeadingSlashIfPresent(url) {
        if (url.indexOf("/") === 0) {
          url = url.substring(1);
        }
        return url;
      }
    }

    function modifyRequestHost(request) {
      var urlToHost = request.url;
      urlToHost = getURLlessProtocol(urlToHost);
      urlToHost = getURLlessPath(urlToHost);

      request.headers.host = urlToHost;

      function getURLlessProtocol(url) {
        return url.replace(EXTERNAL_INDICATOR, "");
      }

      function getURLlessPath(host) {
        var slashIndex = host.indexOf("/");
        var slashInString = slashIndex > 0;

        if (slashInString) {
          host = host.substring(0, slashIndex);
        }
        return host;
      }
    }
  };

}());
