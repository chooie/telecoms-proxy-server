(function() {
  "use strict";

  var http = require("http");
  var fs = require("fs");
  var WebSocketServer = require("websocket").server;

  var constants = require("./constants");
  var util = require("./shared/util");

  var server;

  function start(host, port, fileToServe, callWhenListening) {
    if (!host) {
      throw new Error("requires host parameter");
    }
    if (!port) {
      throw new Error("requires port parameter");
    }

    server = http.createServer();

    server.on("request", function(request, response) {
      console.log(request.url);
      if (request.url === "/") {
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
      server._host = host;
      server._port = port;
      var url = util.createURL(server._host, server._port);
      console.log("Server listening on: " + url);
      console.log("Press Ctrl-C to exit");

      if (typeof callWhenListening === "function") {
        callWhenListening();
      }
    });
  }

  function close(callback) {
      server.close(callback);
  }

  function address() {
    return { host: server._host, port: server._port };
  }

  module.exports = {
    start: start,
    close: close,
    address: address
  };

}());
