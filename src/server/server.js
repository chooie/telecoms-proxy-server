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
    server.on("request", onRequest);
    server.listen(port, callback);
  }

  function onRequest(clientRequest, responseToClient) {
    console.log("Request: " + clientRequest.url);
    if (isHomeRoute(clientRequest.url)) {
      response.statusCode = 200;
      serveFile(responseToClient, homePageToServe);
    } else {
      var url = clientRequest.url;
      var host = clientRequest.headers.host;
      var hostIndex = url.indexOf(host);
      var path = url.substring(hostIndex + host.length);

      console.log(clientRequest.headers.host);
      console.log(clientRequest.method);
      console.log(path);
      console.log(clientRequest.headers);

      var options = {
        host: clientRequest.headers.host,
        method:clientRequest.method,
        path: path,
        headers: clientRequest.headers
      };

      var keepAliveAgent = new http.Agent({ keepAlive: true });
      options.agent = keepAliveAgent;

      var proxy = http.request(options, function(res) {
        res.pipe(responseToClient, {
          end: true
        });
      });

      clientRequest.pipe(proxy, {
        end: true
      });
    }
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
