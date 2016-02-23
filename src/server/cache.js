(function() {
  "use strict";

  var fs = require("fs");
  var crypto = require('crypto');

  var CACHE_DIR = "cache";

  function isCached(filename) {
    var path = CACHE_DIR + filename;

    try {
      fs.statSync(path).isFile();
      console.log("IS CACHED!!!!!");
      return true;
    } catch (e) {
      console.log("IS NOT CACHED");
      console.log(e);
      return false;
    }
  }

  function loadCacheFile(clientRequest) {
    // TODO: finish this
    var filename = crypto.createHash("md5").update(clientRequest.url)
      .digest("hex");

    if (isCached(filename)) {
      fs.readFile(CACHE_DIR + filename, function(err, data) {
        if (err) {
          console.log(err);
          throw err;
        }
        console.log(data);
      });
      return;
    }
  }

  function cacheRequest(filename, data) {
    // TODO: hash url before passing to here
    filename = crypto.createHash("md5").update(filename).digest("hex");
    fs.writeFile("cache/" + filename, data, function(err) {
      if (err) {
        console.log("Caching error: " + err);
      }
      console.log("File saved: " + filename);
    });
  }

}());
