(function() {
  "use strict";

  var http = require("http");
  var assert = require("./assert.js");

  var serverProcess;

  describe("Smoke test", function() {
    before(function() {
      serverProcess = process;
    });

    after(function(done) {
      serverProcess.on("exit", function(code, signal) {
        done();
      });
      serverProcess.kill();
    });

    it("can contact server", function(done) {
      httpGet("http://localhost:8080", function(response, receivedData) {
        var foundPage = receivedData === "Hello, world!";
        assert.equal(foundPage, true, "page should have returned Hello World");
        done();
      });
    });
  });

  function httpGet(url, callback) {
    var request = http.get(url);
    request.on("response", function(response) {
      var receivedData = "";
      response.setEncoding("utf8");

      response.on("data", function(chunk) {
        receivedData += chunk;
      });
      response.on("end", function() {
        callback(response, receivedData);
      });
    });
  }

}());
