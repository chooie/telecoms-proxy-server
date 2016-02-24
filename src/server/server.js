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
        homePageResponse(responseToClient, homePageToServe);

      } else if (route.isBlockedInfoRoute(url)) {

        if (clientRequest.method === "GET") {
          urlBlocker.respondWithBlockedURLsJSON(responseToClient);
        }

      } else if (urlBlocker.isBlockedURL(url)) {
        blockPageResponse(clientRequest, responseToClient);

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

  function homePageResponse(responseToClient, homePageToServe) {
    responseToClient.statusCode = 200;
    serveFile(responseToClient, homePageToServe);
  }

  function notFoundPageResponse(responseToClient, notFoundPageToServe) {
    responseToClient.statusCode = 404;
    serveFile(responseToClient, notFoundPageToServe);
  }

  function blockPageResponse(clientRequest, responseToClient) {
    responseToClient.statusCode = 403;
    responseToClient.end("The url: " + clientRequest.url + " is blocked.");
  }

  function respondWithErrorPage(response, notFoundPageToServe) {
    response.statusCode = 404;
    serveFile(response, notFoundPageToServe);
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
