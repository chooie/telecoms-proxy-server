(function() {
  "use strict";

  var assert = require("../assert.js");
  var http = require("http");
  var fs = require("fs");

  var server = require("./server.js");
  var constants = require("./constants");
  var util = require("./shared/util");

  var TEST_HOME_PAGE = "generated/test/testHome.html";
  var TEST_404_PAGE = "generated/test/test404.html";

  describe("Server", function() {
    var homePageData = "This is the home page file";
    var notFoundPageData = "This is the 404 page file";

    before(function() {
      fs.writeFileSync(TEST_HOME_PAGE, homePageData);
      fs.writeFileSync(TEST_404_PAGE, notFoundPageData);
    });

    after(function(done) {
      Promise.all([cleanUpFile(TEST_HOME_PAGE), cleanUpFile(TEST_404_PAGE)])
        .then(function() {
          done();
        });
    });

    function cleanUpFile(fileName) {
      return new Promise(function(resolve, reject) {
        fs.unlink(fileName, function(err) {
          var noError = !err;
          var fileNotFound = err && err.code === "ENOENT";

          if (noError || fileNotFound) {
            resolve();
          } else {
            reject(err);
          }
        });
      });
    }

    it("serves home page from file", function(done) {
      var url = util.createURL(constants.host, constants.port);

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, homePageData);
        done();
      });
    });

    it("returns home page when asked for index", function(done) {
      var url = util.createURL(constants.host, constants.port, "index.html");

      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.equal(responseData, homePageData);
        done();
      });
    });

    it("returns requested page when it's not the home page", function(done) {
      var externalURL = "http://www.bbc.co.uk/";
      var url = util.createURL(constants.host, constants.port, externalURL);
      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 200, "status code");
        assert.isOk(responseData, "response data");
        done();
      });
    });

    it("returns a block page when requesting a blocked url", function(done) {
      var externalURL = "http://www.test.com/";
      var url = util.createURL(constants.host, constants.port, externalURL);
      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 403, "status code");
        assert.isOk(responseData, "response data");
        done();
      });
    });

    it("returns 404 for everything except home page", function(done) {
      var url = util.createURL(constants.host, constants.port, "blargle");
      httpGet(url, function(response, responseData) {
        assert.equal(response.statusCode, 404, "status code");
        assert.equal(responseData, notFoundPageData);
        done();
      });
    });

    it("requires home page parameter", function(done) {
      assert.throws(function() {
        server.start({ port: constants.port });
      }, Error);
      done();
    });

    it("requires 404 page parameter", function(done) {
      assert.throws(function() {
        server.start({ port: constants.port });
      }, Error);
      done();
    });

    it("requires port parameter", function(done) {
      assert.throws(function() {
        server.start();
      }, Error);
      done();
    });

    it("runs callback when stop completes", function(done) {
      var options = {
        port: constants.port,
        homePageToServe: TEST_HOME_PAGE,
        notFoundPageToServe: TEST_404_PAGE
      };

      server.start(options);
      server.stop(function() {
        done();
      });
    });

    it("stop throws exception when not running", function(done) {
      server.stop(function(err) {
        assert.notEqual(err, undefined);
        done();
      });
    });
  });

  function httpGet(url, callback) {
    var options = {
      port: constants.port,
      homePageToServe: TEST_HOME_PAGE,
      notFoundPageToServe: TEST_404_PAGE
    };
    server.start(options, function() {
      var request = http.get(url);
      request.on("response", function(response) {
        var data = "";

        response.on("data", function(chunk) {
          data += chunk;
        });
        response.on("end", function() {
          server.stop(function() {
            callback(response, data);
          });
        });
      });
    });
  }

}());
