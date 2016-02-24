(function() {
  "use strict";

  var http = require("http");
  var dns = require("dns");
  var fs = require("fs");

  var constants = require("./constants");
  var util = require("./shared/util");
  var urlBlocker = require("./url_blocker");
  var httpsListener = require("./https_listener");
  var route = require("./route");

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
        resolveURL(clientRequest, responseToClient, notFoundPageToServe,
          proxyRequest);
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

  function resolveURL(clientRequest, responseToClient, notFoundPageToServe,
                      callback) {
    var host = clientRequest.headers.host;
    dns.lookup(host, function(err, addresses, family) {
      if (err) {
        console.log("Host couldn't be resolved: " + host);
        notFoundPageResponse(responseToClient, notFoundPageToServe);
        return;
      }
      callback(clientRequest, responseToClient);
    });
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

  function proxyRequest(clientRequest, responseToClient) {
    var options = getRequestOptions(clientRequest);
    request(responseToClient, options);
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

        var url = options.host + options.path;
        //cacheRequest(url ,remoteData)
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
