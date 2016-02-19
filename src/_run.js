(function() {
  "use strict";

  var server = require("./server/server");
  var constants = require("./server/constants");

  server.start(constants.port, "index.html");

}());
