(function() {
  "use strict";

  var server = require("./server/server");
  var constants = require("./server/constants");

  console.log(process.argv[2]);
  var port = parseInt(process.argv[2]);

  if (isNaN(port)) {
    port = constants.port;
  }

  server.start(port, "index.html", "404.html", function() {
    console.log("Server started");
  });
}());
