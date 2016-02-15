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
      options: lintOptions()
    }, complete, fail);
  }, { async: true });

  function lintOptions() {
    return {
      // No bitwise ops
      bitwise: true,
      // Always use curly braces around blocks
      curly: true,
      // Only permit triple equals
      eqeqeq: true,
      // Always filter inherited properties out in `for in` loops
      forin: true,
      // Prevent overwriting prototypes of native objects
      freeze: true,
      // Enables warnings about identifiers defined in future version of
      // JavaScript
      futurehostile: true,
      // Warn __iterator__ property
      iterator: true,
      // Warn about using variables that were declared inside of control
      // structures outside of associated control structures
      funcscope: true,
      // Prohibit use of variable before it's defined. Allow funcs though
      latedef: 'nofunc',
      // Prevent use of arguments.caller and arguments.callee
      noarg: true,
      // Prohibit use of comma operator
      nocomma: true,
      // Warn about "non-breaking whitespace" characters
      nonbsp: true,
      // Prohibits use of constructor functions for side-effects
      nonew: true,
      // Warn when use typeof operator with invalid value
      notypeof: true,
      // Must use strict mode
      strict: true,
      // Prohibit use of explicitly undeclared variables
      undef: true,

      // Environments
      node: true
    };
  }

}());
