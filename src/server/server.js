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
    server.on("request", function(clientRequest, responseToClient) {
      console.log("Request: " + clientRequest.url);
      if (isHomeRoute(clientRequest.url)) {
        responseToClient.statusCode = 200;
        serveFile(responseToClient, homePageToServe);
      } else {
        modifyRequestIfFromLocalhost(clientRequest);
        var host = clientRequest.headers.host;
        dns.lookup(host, function(err, addresses, family) {
          if (err) {
            console.log("Host couldn't be resolved: " + host);
            responseToClient.statusCode = 404;
            serveFile(responseToClient, notFoundPageToServe);
            return;
          }
          proxyRequest(clientRequest, responseToClient);
        });
      }
    });
    server.listen(port, callback);

    function proxyRequest(clientRequest, responseToClient) {
      var options = getRequestOptions(clientRequest);
      request(responseToClient, options);
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

  function modifyRequestIfFromLocalhost(clientRequest) {
    var host = clientRequest.headers.host;
    if (host === "localhost:8080") {
      // Handle case when path is an http url
      var url = clientRequest.url;
      if (url.indexOf("http://")) {
        url = tidyUp(url);
        host = url.replace("http://", "");

        var slashIndex = host.indexOf("/");

        if (slashIndex > 0) {
          host = host.substring(0, slashIndex);
        }

        clientRequest.headers.host = host;
      }
    }
  }

  function tidyUp(url) {
    if (url.indexOf("/") === 0) {
      url = url.substring(1);
    }
    return url;
  }

  function getPath(host, url) {
    var hostIndex = url.indexOf(host);
    return url.substring(hostIndex + host.length);
  }

  function getRequestOptions(clientRequest) {
    var host = clientRequest.headers.host;
    var path = getPath(host, clientRequest.url);

    var options = {
      host: host,
      method: clientRequest.method,
      path: path,
      headers: clientRequest.headers
    };

    var keepAliveAgent = new http.Agent({ keepAlive: true });
    options.agent = keepAliveAgent;

    return options;
  }

  function request(responseToClient, options) {
    var proxyRequest = http.request(options);

    proxyRequest.on("response", function(proxyResponse) {
      var remoteData = [];

      proxyResponse.on("data", function(chunk) {
        remoteData.push(chunk);
      });
      proxyResponse.on("end", function() {
        remoteData = Buffer.concat(remoteData);
        responseToClient.writeHead(
          proxyResponse.statusCode,
          proxyResponse.headers
        );
        responseToClient.end(remoteData);
      });
    });
    proxyRequest.on('error', function(e) {
      console.log("Problem with request: " + e.message);
    });
    proxyRequest.end();
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
