(function() {
  "use strict";

  var debug = require("./debug");

  function log(message) {
    if (debug) {
      console.log(message);
    }
  }

  module.exports = log;

}());
