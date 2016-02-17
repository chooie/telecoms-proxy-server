/* globals jake:false, desc:false, task:false, complete:false, fail:false */

(function() {
  "use strict";

  var jshint = require("simplebuild-jshint");

  desc("Default Task");
  task("default", [ "lint", "test" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Test the JavaScript code");
  task("test", function() {
    console.log("Testing JavaScripts: ");
  });

  desc("Lint the JavaScript code");
  task("lint", function() {
    process.stdout.write("Linting JavaScripts: ");

    jshint.checkFiles({
      files: ["src/**/*.js", "build/**/*.js"],
      options: require("../config/jshint.config")
    }, complete, fail);
  }, { async: true });

}());
