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
    var testDir = "generated/test";
    var testData = "This is served from a file";

    after(function(done) {
      fs.unlink(TEST_FILE, function(err) {
        var noError = !err;
        var fileNotFound = err && err.code === "ENOENT";

        if (noError || fileNotFound) {
          done();
        } else {
          done(err);
        }
      });
    });

    it("serves home page from file", function(done) {

      fs.writeFileSync(TEST_FILE, testData);

      var url = util.createURL(constants.host, constants.port);

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, testData);
        done();
      });
    });

    it("returns 404 for everything except home page", function(done) {
      var url = util.createURL(constants.host, constants.port, "blargle");
      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 404, "status code");
        done();
      });
    });

    it("returns home page when asked for index", function(done) {
      var url = util.createURL(constants.host, constants.port, "index.html");

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, testData);
        done();
      });
    });

    function httpGet(url, callback) {
      server.start(constants.port, TEST_FILE);

      var request = http.get(url);
      request.on("response", function(response) {
        var data = "";

        response.on("data", function(chunk) {
          console.log(data += chunk);
        });
        response.on("end", function() {
          server.close(function() {
            callback(response, data);
          });
        });
      });
    }

    it("requires port number and file to serve", function(done) {
      assert.throws(function() {
        server.start();
      }, Error);
      done();
    });

    it("runs callback when close completes", function(done) {
      server.start(constants.port, TEST_FILE);
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
