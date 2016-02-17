(function() {
  "use strict";

  var http = require("http");
  var WebSocketServer = require("websocket").server;
  var constants = require("./constants");

  var server;

  exports.start = function() {
    server = http.createServer(function(request, response) {
      console.log("Received Request!");
      response.end(constants.helloMessage);
    });

    server.listen(constants.port, function() {
      console.log("Server listening on: " + constants.url);
    });
  };

  exports.close = function(callback) {
      server.close(callback);
  };

}());
