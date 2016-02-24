(function() {
  "use strict";

  var fs = require("fs");

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

  function serveFile(response, pageToServe) {
    fs.readFile(pageToServe, function(err, data) {
      if (err) {
        throw err;
      }
      response.end(data);
    });
  }

  module.exports = {
    homePageResponse: homePageResponse,
    notFoundPageResponse: notFoundPageResponse,
    blockPageResponse: blockPageResponse,
  };

}());
