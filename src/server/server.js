(function() {
  "use strict";

  var http = require("http");
  var fs = require("fs");
  var WebSocketServer = require("websocket").server;

  var constants = require("./constants");
  var util = require("./shared/util");

  var server;

  var BASE_URL = "http://localhost:8080";

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
    server.on("request", function(request, response) {
      console.log("Request: ");
      console.log(request.url);

      var homeStub = "/home";
      var altHomeStub = "/index.html";

      if (isHomeRoute(request.url)) {
        response.statusCode = 200;
        serveFile(response, homePageToServe);
      } else {
        response.statusCode = 404;
        serveFile(response, notFoundPageToServe);
      }
    });

    function isHomeRoute(url) {
      return (url === "/" ||
          url === "/index.html" ||
          url === BASE_URL + "/" ||
          url === BASE_URL + "/index.html");
    }

    server.listen(port, callback);
  }

  function stop(callback) {
    server.close(callback);
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
