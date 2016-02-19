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

        var request = http.get(util.createURL(host, port));
        request.on("response", function(response) {
          var data = "";

          response.on("data", function(chunk) {
            console.log(data += chunk);
          });
          response.on("end", function() {
            assert.equal(data, testData);
            server.close(function() {
              done();
            });
          });
        });
      }
    });

    it("returns 404 for everything except home page", function(done) {
      var testDir = "generated/test";
      var testData = "This is served from a file";

      fs.writeFileSync(TEST_FILE, testData);
      server.start(constants.host, constants.port, TEST_FILE,
        callWhenListening);

      function callWhenListening() {
        var address = server.address();
        var url = util.createURL(address.host, address.port, "blargle");
        httpGet(url, function(response, responseData) {
          assert.equal(response.statusCode, 404, "status code");
          server.close(function() {
            done();
          });
        });
      }

      function httpGet(url, callback) {
        var request = http.get(url);
        request.on("response", function(response) {
          var data = "";

          response.on("data", function(chunk) {
            console.log(data += chunk);
          });
          response.on("end", function() {
            callback(response, data);
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
