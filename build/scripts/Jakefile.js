(function() {
  "use strict";

  desc("Default Task");
  task("default", [ "lint" ], function() {
    console.log("\n\nBUILD OK");
  });

  desc("Lint the Javascript code");
  task("lint", function() {
    console.log("Linting Javascripts: ");
  });

}());
