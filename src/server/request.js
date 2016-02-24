(function() {
  "use strict";

  var http = require("http");
  var dns = require("dns");

  var response = require("./response");
  var log = require("../log");

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
      log("Problem with request: " + e.message);
    });
    proxyRequest.end();
  }

  function proxyRequest(clientRequest, responseToClient) {
    var options = getRequestOptions(clientRequest);
    request(responseToClient, options);
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

  function resolveURL(clientRequest, responseToClient, notFoundPageToServe,
                      callback) {
    var host = clientRequest.headers.host;
    dns.lookup(host, function(err, addresses, family) {
      if (err) {
        log("Host couldn't be resolved: " + host);
        response.notFoundPageResponse(responseToClient, notFoundPageToServe);
        return;
      }
      callback(clientRequest, responseToClient);
    });
  }

  function getPath(host, url) {
    var hostIndex = url.indexOf(host);
    return url.substring(hostIndex + host.length);
  }

  module.exports = {
    request: request,
    proxyRequest: proxyRequest,
    resolveURL: resolveURL
  };

}());
