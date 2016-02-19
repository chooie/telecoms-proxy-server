/* globals jake:false, desc:false, task:false, complete:false, fail:false,
           directory:false */

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
  var GENERATED_DIR = "generated";
  var TEMP_TEST_FILE_DIR = GENERATED_DIR + "/test";

  directory(TEMP_TEST_FILE_DIR);

  //*** GENERAL
  desc("Lint and test everything");
  task("default", [ "lint", "test" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Delete all generated files");
  task("clean", function() {
    jake.rmRf(GENERATED_DIR);
  });

  desc("Start localhost server for manual testing");
  task("run", function() {
    jake.exec("node src/_run.js", { printStdout: true }, function() {
      complete();
    });
  }, { async: true });

  //*** TEST
  desc("Test the JavaScript code");
  task("test", [ TEMP_TEST_FILE_DIR, "testServer" ]);

  task("testServer", function() {
    process.stdout.write("Testing Node.js code: ");
    mocha.runTests({
      files: [ "src/server/**/_*_test.js" ],
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
