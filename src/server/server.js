(function() {
  "use strict";

  var http = require("http");

  var RequestHandler = require("./request_handler");
  var httpsListener = require("./https_listener");

  var server;

  function start(options, callback) {
    checkOptions(options);
    var requestHandler = new RequestHandler(
      options.homePageToServe,
      options.notFoundPageToServe
    );
    setupServer(requestHandler, options.port, callback);
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

  function setupServer(requestHandler, port, callback) {
    server = http.createServer();
    server.on("request", requestHandler.handle.bind(requestHandler));
    httpsListener(server);
    server.listen(port, callback);
  }

  module.exports = {
    start: start,
    stop: stop,
  };
}());
