(function() {
  "use strict";

  var server = require("./server/server");
  var constants = require("./server/constants");

  server.start(constants.host, constants.port);

}());
