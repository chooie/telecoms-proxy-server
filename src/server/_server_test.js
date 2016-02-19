(function() {
  "use strict";

  var assert = require("../assert.js");
  var http = require("http");
  var fs = require("fs");

  var server = require("./server.js");
  var constants = require("./constants");
  var util = require("./shared/util");

  var TEST_FILE = "generated/test/test.html";

  describe("Server", function() {
    after(function(done) {
      fs.unlink(TEST_FILE, function(err) {
        var noError = !err;
        var fileNotFound = err && err.code === "ENOENT";

        if (noError || fileNotFound) {
          return done();
        } else {
          done(err);
        }
      });
    });

    it("serves a file", function(done) {
      var testDir = "generated/test";
      var testData = "This is served from a file";

      fs.writeFileSync(TEST_FILE, testData);
      server.start(constants.host, constants.port, TEST_FILE,
        callWhenListening);

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
            assert.equal(data, testData);
            server.close(function() {
              done();
            });
          });
        });
      }
    });

    it("requires host and port number", function(done) {
      assert.throws(function() {
        server.start();
      }, Error);
      done();
    });

    it("runs callback when close completes", function(done) {
      server.start(constants.host, constants.port, TEST_FILE);
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
