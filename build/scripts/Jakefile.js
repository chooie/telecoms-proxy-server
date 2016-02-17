/* globals jake:false, desc:false, task:false, complete:false, fail:false */

(function() {
  "use strict";

  var jshint = require("simplebuild-jshint");
  var mocha = require("../util/mocha_runner.js");

  var MOCHA_CONFIG = {
    ui: "bdd",
    reporter: "spec"
  };

  var JSHINT_CONFIG_PATH = "../config/jshint.config";
  var MOCHA_BIN_PATH = "./node_modules/.bin/mocha";
  var TEST_FILES_PATH = "src/**/_*_test.js";

  //*** GENERAL

  desc("Lint and test everything");
  task("default", [ "lint", "test" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Start localhost server for manual testing");
  task("run", function() {
    var runServer = require("./src/_run_server.js");

    console.log("Running server. Press Ctrl-C to stop.");
    runServer.runInteractively();
    // We never call complete() because we want the task to hang until the user
    // presses 'Ctrl-C'.
  }, { async: true });

  //*** TEST
  desc("Test the JavaScript code");
  task("test", [ "testServer", "testSmoke" ]);

  task("testServer", function() {
    process.stdout.write("Testing Node.js code: ");
    mocha.runTests({
      files: [ "src/server/**/_*_test.js" ],
      options: MOCHA_CONFIG
    }, complete, fail);
  }, { async: true });


  task("testSmoke", [ "build" ], function() {
    process.stdout.write("Running local smoke tests: ");
    mocha.runTests({
      files: [ "src/_smoke_test.js" ],
      options: MOCHA_CONFIG
    }, complete, fail);
  }, { async: true });

  //*** LINT
  desc("Lint the JavaScript code");
  task("lint", function() {
    process.stdout.write("Linting JavaScripts: ");

    jshint.checkFiles({
      files: ["src/**/*.js", "build/**/*.js"],
      options: require(JSHINT_CONFIG_PATH).options,
      globals: require(JSHINT_CONFIG_PATH).globals
    }, complete, fail);
  }, { async: true });

}());
