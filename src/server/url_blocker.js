(function() {
  "use strict";

  var blockedURLs = [
    "http://www.test.com/"
  ];

  module.exports.getBlockedURLs = function() {
    return blockedURLs;
  };

  module.exports.isBlockedURL = function(url) {
    return blockedURLs.indexOf(url) !== -1;
  };

  module.exports.addURL = function() {

  };

  module.exports.removeURL = function() {

  };

}());
