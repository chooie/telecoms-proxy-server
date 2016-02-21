(function() {
  "use strict";

  var http = require("http");
  var dns = require("dns");
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
      if (isHomeRoute(request.url)) {
        response.statusCode = 200;
        serveFile(response, homePageToServe);
      } else {
        var url = request.url;
        url = tidyUp(url);


        var urlInfo = parseURL(url);

        if (!urlInfo) {
          respondWithErrorPage(response, notFoundPageToServe);
          return;
        }

        var hostname = urlInfo.hostname;
        hostname = hostname.replace("www.", "");

        dns.lookup(hostname, function(err, addresses, family) {
          if (err) {
            response.statusCode = 404;
            serveFile(response, notFoundPageToServe);
            return;
          }

          if (url.indexOf("http") !== -1) {
            httpGet(url, function(res, responseData) {
              response.statusCode = 200;
              response.end(responseData);
              return;
            });
          //} else {
          //  console.log("DON'T GO HERE");
          //  response.statusCode = 404;
          //  serveFile(response, notFoundPageToServe);
          }
        });
      }
    });
    server.listen(port, callback);
  }

  function stop(callback) {
    server.close(callback);
  }

  function isHomeRoute(url) {
    return (url === "/" ||
    url === "/index.html" ||
    url === BASE_URL + "/" ||
    url === BASE_URL + "/index.html");
  }

  function tidyUp(url) {
    if (url.indexOf("/") === 0) {
      url = url.substring(1);
    }
    return url;
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

  function httpGet(url, callback) {
    var request = http.get(url);
    request.on("response", function(response) {
      var data = "";

      response.on("data", function(chunk) {
        data += chunk;
      });
      response.on("end", function() {
        callback(response, data);
      });
      response.on("error", function(error) {
        console.log("Got error: " + error.message);
      });
    });
  }

  function parseURL(url) {
    console.log("Matching: " + url);
    var urlInfo = new RegExp([
      "^(https?:)\/\/", // protocol (1)
      "(([^:/?#]*)(?::([0-9]+))?)", // host (2) (hostname (3) and port (4))
      "(\/[^?#]*)", // pathname (5)
      "(\\?[^#]*|)", // search (6)
      "(#.*|)$" // hash (7)
    ].join(""));

    var match = url.match(urlInfo);

    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    };
  }

  module.exports = {
    start: start,
    stop: stop,
  };

}());
