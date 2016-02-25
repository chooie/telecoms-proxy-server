(function() {
  "use strict";

  var route = require("./route");
  var responseUtil = require("./response");
  var requestUtil = require("./request");
  var urlBlocker = require("./url_blocker");
  var log = require("../log");

  var $ = RequestHandler;

  function RequestHandler(homePageToServe, notFoundPageToServe) {
    this.homePageToServe = homePageToServe;
    this.notFoundPageToServe = notFoundPageToServe;
  }

  $.prototype.handle = function(request, response) {
    route.modifyRequestIfFromLocalhost(request);
    log("HTTP Request: " + request.url);
    this.respond(request, response);
  };

  $.prototype.respond = function(request, response) {
    var url = request.url;

    if (route.isHomeRoute(url)) {
      this.serveHome(response);
    } else if (route.isBlockedInfoRoute(url)) {
      this.serveBlockedInfo(response);
    } else if (urlBlocker.isBlockedURL(url)) {
      this.blockRequest(request, response);
    } else {
      this.requestThenServe(request, response);
    }
  };

  $.prototype.serveHome = function(response) {
    responseUtil.homePageResponse(response, this.homePageToServe);
  };

  $.prototype.serveBlockedInfo = function(response) {
    if (this.isGetRequest(this.request)) {
      urlBlocker.respondWithBlockedURLsJSON(response);
    } else {
      responseUtil.notFoundPageResponse(response, this.notFoundPageToServe);
    }
  };

  $.prototype.blockRequest= function(request, response) {
    responseUtil.blockPageResponse(request, response);
  };

  $.prototype.requestThenServe = function(request, response) {
    requestUtil
      .resolveURL(request, response, this.notFoundPageToServe,
        requestUtil.proxyRequest);
  };

  $.prototype.isGetRequest = function(request) {
    return request.method === "GET";
  };

  module.exports = RequestHandler;

}());
