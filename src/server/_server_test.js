(function() {
  "use strict";

  var assert = require("../assert.js");
  var http = require("http");

  var server = require("./server.js");
  var constants = require("./constants");

  describe("Server", function() {
    before(function() {
      server.start();
    });

    after(function(done) {
      server.close(done);
    });

    it("responds with 'Hello, world!'", function(done) {
      http.get(constants.url, function(res) {
        var data = "";

        res.on("data", function(chunk) {
          console.log(data += chunk);
        });
        res.on("end", function() {
          assert.equal(data, constants.helloMessage);
          done();
        });
      });
    });

    it("runs callback when stop completes", function(done) {
      server.close(function() {
        done();
      });
      server.start(); // TODO: Make this less kludgy
    });
  });

}());
