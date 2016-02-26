(function() {
  "use strict";

  var child_process = require("child_process");
  var http = require("http");

  var assert = require("./assert");
  var serverConstants = require("./server/shared/constants");
  var serverUtil = require("./server/shared/util");
  var log = require("./log");

  describe("Smoke Test", function() {
    var child;

    before(function(done) {
      runServer(done);
    });

    after(function(done) {
      child.on("exit", function() {
        done();
      });
      child.kill();
    });

    it("can get home page", function(done) {
      var url = serverUtil.createURL(serverConstants.host,
          serverConstants.port);
      httpGet(url, function(response, receivedData) {
        var matchString = "Proxy Server home page";
        var foundHomePage = receivedData.indexOf(matchString) !== -1;
        assert.isOk(foundHomePage, "home page should have contained test " +
          "marker");
        done();
      });
    });

    it("can get 404 page", function(done) {
      var url = serverUtil.createURL(serverConstants.host,
        serverConstants.port, "nonexistant");
      httpGet(url, function(response, receivedData) {
        var matchString = "Proxy server 404 page";
        var found404Page = receivedData.indexOf(matchString) !== -1;
        assert.isOk(found404Page, "404 page should have contained test " +
          "marker");
        done();
      });
    });

    function runServer(callback) {
      child = child_process.spawn(
        "node",
        [ "src/_run", serverConstants.port ]
      );
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", function(chunk) {
        if (chunk.trim() === "Server started") {
          callback();
        } else {
          log(chunk);
        }
      });
      child.stderr.on("data", function(chunk) {
        console.log("server stderr: " + chunk);
      });
      child.stdout.on("exit", function(code, signal) {
        console.log("Server process exited with code [" + code + "] and " +
          "signal [" + signal + "]");
      });
    }
  });


  // TODO: eliminate duplication w/ _server_test.js
  function httpGet(url, callback) {
    var request = http.get(url);
    request.on("response", function(response) {
      var data = "";

      response.on("data", function(chunk) {
        data += chunk;
      });
      response.on("end", function() {
        callback(response, data);
      });
    });
  }

}());
