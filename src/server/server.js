(function() {
  "use strict";

  var http = require("http");
  var fs = require("fs");
  var WebSocketServer = require("websocket").server;

  var constants = require("./constants");
  var util = require("./shared/util");

  var server;

  function start(port, homePageToServe, notFoundPageToServe) {
    if (!port) {
      throw new Error("requires port parameter");
    }
    if (!homePageToServe) {
      throw new Error("requires home page parameter");
    }
    if (!notFoundPageToServe) {
      throw new Error("requires 404 page parameter");
    }

    server = http.createServer();
    server.on("request", function(request, response) {
      if (request.url === "/" || request.url === "/index.html") {
        response.statusCode = 200;
        serveFile(response, homePageToServe);
      } else {
        response.statusCode = 404;
        serveFile(response, notFoundPageToServe);
      }
    });
    server.listen(constants.port);
  }

  function stop(callback) {
    server.close(callback);
  }

  function serveFile(response, pageToServe) {
    fs.readFile(pageToServe, function(err, data) {
      if (err) {
        throw err;
      }
      response.end(data);
    });
  }

  module.exports = {
    start: start,
    stop: stop,
  };

}());
