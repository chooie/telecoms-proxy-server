(function() {
  "use strict";

  var http = require("http");
  var WebSocketServer = require("websocket").server;

  var PORT = 8080;

  var server;

  exports.start = function() {
    server = http.createServer(function(request, response) {
      console.log("Received Request!");
      response.end("Hello, world!");
    });

    server.listen(PORT, function() {
      console.log("Server listening on: http://localhost:" + PORT);
    });
  };

  exports.close = function() {
      server.close();
  };

}());
