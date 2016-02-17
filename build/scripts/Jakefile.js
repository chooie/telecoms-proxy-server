/* globals jake:false, desc:false, task:false, complete:false, fail:false */

(function() {
  "use strict";

  var jshint = require("simplebuild-jshint");
  var JSHINT_CONFIG_PATH = "../config/jshint.config";

  var MOCHA_BIN_PATH = "./node_modules/.bin/mocha";
  var TEST_FILES_PATH = "src/**/_*_test.js";

  desc("Default Task");
  task("default", [ "lint", "test" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Test the JavaScript code");
  task("test", function() {
    console.log("Testing JavaScripts: ");
    jake.exec(MOCHA_BIN_PATH + " " + TEST_FILES_PATH,
      { printStdout: true},
      function() {
        console.log("All tests passed.");
        complete();
      }
    );
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
