(function() {
  "use strict";

  var assert = require("../assert.js");
  var http = require("http");
  var fs = require("fs");

  var server = require("./server.js");
  var constants = require("./constants");
  var util = require("./shared/util");

  describe("Server", function() {
    it("responds with 'Hello, world!'", function(done) {
      server.start(constants.host, constants.port, callWhenListening);

      function callWhenListening() {
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
            server.close();
            done();
          });
        });
      }
    });

    it("serves a file", function(done) {
      var testDir = "generated/test";
      var testFile = testDir + "/test.html";

      try {
        fs.writeFileSync(testFile, "Hello world");
      } finally {
        fs.unlinkSync(testFile);
        assert.isOk(
          !fs.existsSync(testFile),
          "could not delete test file: [" + testFile + "]"
        );
        done();
      }
    });

    it("requires host and port number", function(done) {
      assert.throws(function() {
        server.start();
      }, Error);
      done();
    });

    it("runs callback when close completes", function(done) {
      server.start(constants.host, constants.port);
      server.close(function() {
        done();
      });
    });

    it("error when close called on already-closed server", function(done) {
      server.close(function(err) {
        assert.notEqual(err, undefined);
        done();
      });
    });
  });

}());
