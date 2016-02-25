(function() {
  "use strict";

  var http = require("http");

  var RequestHandler = require("./request_handler");
  var httpsListener = require("./https_listener");

  var server;

  function start(options, callback) {
    checkOptions(options);
    server = http.createServer();
    var rh = new RequestHandler(
      options.homePageToServe,
      options.notFoundPageToServe
    );
    server.on("request", rh.handle.bind(rh));
    httpsListener(server);
    server.listen(options.port, callback);
  }

  function stop(callback) {
    server.close(callback);
  }

  function checkOptions(options) {
    if (!options.port) {
      throw new Error("requires port parameter");
    }
    if (!options.homePageToServe) {
      throw new Error("requires home page parameter");
    }
    if (!options.notFoundPageToServe) {
      throw new Error("requires 404 page parameter");
    }
  }

  module.exports = {
    start: start,
    stop: stop,
  };
}());
