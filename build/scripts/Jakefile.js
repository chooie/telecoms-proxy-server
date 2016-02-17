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

  desc("Default Task");
  task("default", [ "lint", "test" ], function() {
    console.log("\n\nBUILD OK");
  });

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
