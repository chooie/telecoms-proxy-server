(function() {
  "use strict";

  var assert = require("../assert.js");
  var http = require("http");

  var server = require("./server.js");
  var constants = require("./constants");
  var util = require("./shared/util");

  describe("Server", function() {
    before(function(done) {
      server.start(constants.host, constants.port, done);
    });

    after(function(done) {
      server.close(done);
    });

    it("responds with 'Hello, world!'", function(done) {
      var address = server.address();
      var host = address.host;
      var port = address.port;

      var url = util.createURL(host, port);
      http.get(url, function(res) {
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
      // TODO: Make this less kludgy
      server.start(constants.host, constants.port);
    });
  });

}());
