(function() {
  "use strict";

  var server = require("./server/server");
  var constants = require("./server/constants");

  var CONTENT_DIR = "src/content";
  var INDEX_PATH = CONTENT_DIR + "/index.html";
  var NOT_FOUND_PATH = CONTENT_DIR + "/404.html";

  var port = parseInt(process.argv[2]);

  if (isNaN(port)) {
    port = constants.port;
  }

  var options = {
    port: port,
    homePageToServe: INDEX_PATH,
    notFoundPageToServe: NOT_FOUND_PATH
  };

  server.start(options, function() {
    // This must be logged for smoke test to work!
    console.log("Server started");
  });
}());
