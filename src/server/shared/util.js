(function() {
  "use strict";

  exports.createURL = function (host, port, path) {
    if (typeof path === "undefined") {
      path = "";
    }
    return "http://" + host + ":" + port + "/" + path;
  };

}());
