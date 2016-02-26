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
    route.modifyRequestIfFromLocalHost(request);
    log("HTTP Request: " + request.url);
    this._respond(request, response);
  };

  $.prototype._respond = function(request, response) {
    var url = request.url;

    if (route.isHomeRoute(url)) {
      this._serveHome(response);
    } else if (route.isBlockedInfoRoute(url)) {
      this._serveBlockedInfo(request, response);
    } else if (urlBlocker.isBlockedURL(url)) {
      this._blockRequest(request, response);
    } else {
      this._requestThenServe(request, response);
    }
  };

  $.prototype._serveHome = function(response) {
    responseUtil.homePageResponse(response, this.homePageToServe);
  };

  $.prototype._serveBlockedInfo = function(request, response) {
    if (isGetRequest(request)) {
      urlBlocker.respondWithBlockedURLsJSON(response);
    } else {
      responseUtil.notFoundPageResponse(response, this.notFoundPageToServe);
    }
  };

  $.prototype._blockRequest= function(request, response) {
    responseUtil.blockPageResponse(request, response);
  };

  $.prototype._requestThenServe = function(request, response) {
    requestUtil
      .resolveURL(request, response, this.notFoundPageToServe,
        requestUtil.proxyRequest);
  };

  function isGetRequest(request) {
    return request.method === "GET";
  }

  module.exports = RequestHandler;

}());
