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
    var expectedData = "This is served from a file";

    before(function(done) {
      fs.writeFile(TEST_FILE, expectedData, function() {
        done();
      });
    });

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
      var url = util.createURL(constants.host, constants.port);

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, expectedData);
        done();
      });
    });

    it("returns home page when asked for index", function(done) {
      var url = util.createURL(constants.host, constants.port, "index.html");

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, expectedData);
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

    it("requires file parameter", function(done) {
      assert.throws(function() {
        server.start(constants.port);
      }, Error);
      done();
    });

    it("requires port parameter", function(done) {
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

    it("close throws exception when not running", function(done) {
      server.close(function(err) {
        assert.notEqual(err, undefined);
        done();
      });
    });
  });

  function httpGet(url, callback) {
    server.start(constants.port, TEST_FILE);

    var request = http.get(url);
    request.on("response", function(response) {
      var data = "";

      response.on("data", function(chunk) {
        data += chunk;
      });
      response.on("end", function() {
        server.close(function() {
          callback(response, data);
        });
      });
    });
  }

}());
