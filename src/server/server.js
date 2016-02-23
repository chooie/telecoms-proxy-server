(function() {
  "use strict";

  var http = require("http");
  var dns = require("dns");
  var fs = require("fs");
  var WebSocketServer = require("websocket").server;
  var crypto = require('crypto');

  var constants = require("./constants");
  var util = require("./shared/util");
  var urlBlocker = require("./url_blocker");
  var httpsListener = require("./https_listener");

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
      console.log("HTTP Request: " + clientRequest.url);
      modifyRequestIfFromLocalhost(clientRequest);

      if (isHomeRoute(clientRequest.url)) {
        homePageResponse(responseToClient, homePageToServe);

      } else if (clientRequest.url === "/blocked" ||
                 clientRequest.url === BASE_URL + "/blocked") {

        console.log("HEY THERE");
        console.log(clientRequest.method);
        if (clientRequest.method === "GET") {
          responseToClient.statusCode = 200;
          responseToClient.end(JSON.stringify(urlBlocker.getBlockedURLs()));
        }

      } else if (urlBlocker.isBlockedURL(clientRequest.url)) {
        blockPageResponse(clientRequest, responseToClient);

      } else {
        //var filename = crypto.createHash("md5").update(clientRequest.url)
        //  .digest("hex");
        //
        //if (isCached(filename)) {
        //  fs.readFile("cache/" + filename, function(err, data) {
        //    if (err) {
        //      console.log(err);
        //      throw err;
        //    }
        //    console.log(data);
        //  });
        //  return;
        //}

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
    httpsListener(server);
    server.listen(port, function() {
      callback();
    });
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

  function homePageResponse(responseToClient, homePageToServe) {
    responseToClient.statusCode = 200;
    serveFile(responseToClient, homePageToServe);
  }

  function blockPageResponse(clientRequest, responseToClient) {
    responseToClient.statusCode = 403;
    responseToClient.end("The url: " + clientRequest.url + " is blocked.");
  }

  function modifyRequestIfFromLocalhost(clientRequest) {
    var host = clientRequest.headers.host;

    if (host === "localhost:8080") {
      // Handle case when path is an http url
      var url = clientRequest.url;

      if (url.indexOf("/http://") > -1) {
        url = tidyUp(url);
        host = url.replace("http://", "");

        var slashIndex = host.indexOf("/");

        if (slashIndex > 0) {
          host = host.substring(0, slashIndex);
        }

        clientRequest.url = url;
        clientRequest.headers.host = host;
      }
    }
  }

  function proxyRequest(clientRequest, responseToClient) {
    var options = getRequestOptions(clientRequest);
    request(responseToClient, options);
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

  function isCached(filename) {
    var path = "cache/" + filename;

    try {
      return fs.statSync(path).isFile()
      console.log("IS CACHED!!!!!");
    } catch (e) {
      console.log("IS NOT CACHED");
      console.log(e);
      return false;
    }
  }

  function cacheRequest(filename, data) {
    // TODO: hash url before passing to here
    filename = crypto.createHash("md5").update(filename).digest("hex");
    fs.writeFile("cache/" + filename, data, function(err) {
      if (err) {
        console.log("Caching error: " + err);
      }
      console.log("File saved: " + filename);
    });
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
