(function() {
  "use strict";

  var http = require("http");
  var WebSocketServer = require("websocket").server;
  var constants = require("./constants");
  var util = require("./shared/util");

  var server;

  function start(host, port, callWhenListening) {
    if (!host) {
      throw new Error("requires host parameter");
    }
    if (!port) {
      throw new Error("requires port parameter");
    }

    server = http.createServer(function(request, response) {
      console.log("Received Request!");
      response.end(constants.helloMessage);
    });

    server.listen(port, function() {
      server._host = host;
      server._port = port;
      var url = util.createURL(server._host, server._port);
      console.log("Server listening on: " + url);
      callWhenListening();
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
