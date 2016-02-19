(function() {
  "use strict";

  var http = require("http");
  var fs = require("fs");
  var WebSocketServer = require("websocket").server;

  var constants = require("./constants");
  var util = require("./shared/util");

  var server;

  function start(port, fileToServe) {
    if (!port) {
      throw new Error("requires port parameter");
    }
    if (!fileToServe) {
      throw new Error("requires port parameter");
    }

    server = http.createServer();

    server.on("request", function(request, response) {
      if (request.url === "/" || request.url === "/index.html") {
        fs.readFile(fileToServe, function(err, data) {
          if (err) {
            throw err;
          }
          response.end(data);
        });
      } else {
        response.statusCode = 404;
        response.end("404: Page not found.");
      }
    });

    server.listen(port, function() {
      //var url = util.createURL(constants.host, port);
      //console.log("Server listening on: " + url);
      //console.log("Press Ctrl-C to exit");
    });
  }

  function close(callback) {
      server.close(callback);
  }

  module.exports = {
    start: start,
    close: close,
  };

}());
