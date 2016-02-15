/* globals jake:false, desc:false, task:false, complete:false, fail:false */

(function() {
  "use strict";

  var jshint = require("simplebuild-jshint");

  desc("Default Task");
  task("default", [ "lint" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Lint the Javascript code");
  task("lint", function() {
    process.stdout.write("Linting Javascripts: ");

    jshint.checkFiles({
      files: ["src/**/*.js", "build/**/*.js"],
      options: require("../config/jshint.config")
    }, complete, fail);
  }, { async: true });

}());
