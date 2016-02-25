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
  var log = require("../log");

  var server;

  function start(options, callback) {
    checkOptions(options);
    server = http.createServer();
    var curryResponseWithOptions = respondToRequest.bind(null, options);
    server.on("request", curryResponseWithOptions);
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

  function respondToRequest(options, clientRequest, responseToClient) {
    route.modifyRequestIfFromLocalhost(clientRequest);
    log("HTTP Request: " + clientRequest.url);
    respond(options.homePageToServe, options.notFoundPageToServe,
      clientRequest, responseToClient);
  }

  function respond(homePageToServe, notFoundPageToServe, clientRequest,
                   responseToClient) {
    var url = clientRequest.url;

    if (route.isHomeRoute(url)) {
      serveHome(responseToClient, homePageToServe);
    } else if (route.isBlockedInfoRoute(url)) {
      serveBlockedInfo(clientRequest, responseToClient, notFoundPageToServe);
    } else if (urlBlocker.isBlockedURL(url)) {
      blockRequest(clientRequest, responseToClient);
    } else {
      requestThenServe(clientRequest, responseToClient, notFoundPageToServe);
    }
  }

  function serveHome(responseToClient, homePageToServe) {
    response.homePageResponse(responseToClient, homePageToServe);
  }

  function serveBlockedInfo(clientRequest, responseToClient,
                            notFoundPageToServe) {
    if (isGetRequest(clientRequest)) {
      urlBlocker.respondWithBlockedURLsJSON(responseToClient);
    } else {
      response.notFoundPageResponse(responseToClient, notFoundPageToServe);
    }
  }

  function blockRequest(clientRequest, responseToClient) {
    response.blockPageResponse(clientRequest, responseToClient);
  }

  function requestThenServe(clientRequest, responseToClient,
                                         notFoundPageToServe) {
    request.resolveURL(clientRequest, responseToClient, notFoundPageToServe,
      request.proxyRequest);
  }

  function isGetRequest(clientRequest) {
    return clientRequest.method === "GET";
  }

  module.exports = {
    start: start,
    stop: stop,
  };
}());
