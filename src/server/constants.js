(function() {
  "use strict";

  function Constants() {
    this.port = 8080;
    this.url = "http://localhost:" + this.port;
    this.helloMessage = "Hello, world!";
  }

  module.exports = new Constants();

}());
