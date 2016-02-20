(function() {
  "use strict";

  var child_process = require("child_process");
  var http = require("http");
  var assert = require("./assert");
  var server = require("./server/server");
  var serverConstants = require("./server/constants");
  var serverUtil = require("./server/shared/util");

  describe("Smoke Test", function() {
    it.skip("tests for smoke", function(done) {
      runServer(function() {
        var url = serverUtil.createURL(serverConstants.host,
          serverConstants.port);
        httpGet(url, function() {
          done();
        });
      });
    });
  });

  function runServer(callback) {
    var child = child_process.spawn(
      "node",
      [ "src/_run", serverConstants.port ]
    );
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", function(chunk) {
      console.log("server stdout: " + chunk);
      if (chunk.trim() === "Server started") {
        console.log("calling callback");
        callback();
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
