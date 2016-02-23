(function() {
  "use strict";

  var blockedURLs = [
    "http://www.test.com/"
  ];

  function getBlockedURLs() {
    return blockedURLs;
  }

  function isBlockedURL(url) {
    return blockedURLs.indexOf(url) !== -1;
  }

  function addURL() {

  }

  function removeURL() {

  }

  function respondWithBlockedURLsJSON(responseToClient) {
    responseToClient.statusCode = 200;
    responseToClient.end(JSON.stringify(getBlockedURLs()));
  }

  module.exports = {
    getBlockedUrls: getBlockedURLs,
    isBlockedURL: isBlockedURL,
    addURL: addURL,
    removeURL: removeURL,
    respondWithBlockedURLsJSON: respondWithBlockedURLsJSON
  };

}());
