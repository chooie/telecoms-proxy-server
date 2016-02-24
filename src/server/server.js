(function() {
  "use strict";

  var http = require("http");
  var fs = require("fs");

  var constants = require("./constants");
  var util = require("./shared/util");
  var urlBlocker = require("./url_blocker");
  var httpsListener = require("./https_listener");
  var route = require("./route");
  var request = require("./request");
  var response = require("./response");

  var server;

  function start(port, homePageToServe, notFoundPageToServe, callback) {
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
    server.on("request", function(clientRequest, responseToClient) {
      route.modifyRequestIfFromLocalhost(clientRequest);

      console.log("HTTP Request: " + clientRequest.url);
      var url = clientRequest.url;

      if (route.isHomeRoute(url)) {
        response.homePageResponse(responseToClient, homePageToServe);

      } else if (route.isBlockedInfoRoute(url)) {

        if (clientRequest.method === "GET") {
          urlBlocker.respondWithBlockedURLsJSON(responseToClient);
        }

      } else if (urlBlocker.isBlockedURL(url)) {
        response.blockPageResponse(clientRequest, responseToClient);

      } else {
        request.resolveURL(clientRequest, responseToClient, notFoundPageToServe,
          request.proxyRequest);
      }
    });
    httpsListener(server);
    server.listen(port, function() {
      callback();
    });
  }

  function stop(callback) {
    server.close(callback);
  }

  module.exports = {
    start: start,
    stop: stop,
  };

}());
