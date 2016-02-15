(function() {
  "use strict";

  var http = require("http");

  var PORT = 8080;

  var server = http.createServer(function(request, response) {
    response.end("Hello, world!");
  });

  server.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
  });

}());
