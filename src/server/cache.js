(function() {
  "use strict";

  var fs = require("fs");
  var crypto = require("crypto");
  var log = require("../log");

  var CACHE_DIR = "cache";

  function isCached(filename) {
    var path = CACHE_DIR + filename;

    try {
      fs.statSync(path).isFile();
      log("IS CACHED!!!!!");
      return true;
    } catch (e) {
      log("IS NOT CACHED");
      log(e);
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
          log(err);
          throw err;
        }

        log(data);

      });
      return;
    }
  }

  function cacheRequest(filename, data) {
    // TODO: hash url before passing to here
    filename = crypto.createHash("md5").update(filename).digest("hex");
    fs.writeFile("cache/" + filename, data, function(err) {
      if (err) {
        log("Caching error: " + err);
      }

      log("File saved: " + filename);
    });
  }

  module.exports = {
    loadCacheFile: loadCacheFile,
    cacheRequest: cacheRequest
  };

}());
