(function() {
  "use strict";

  var debug = false;

  var net = require("net");

  module.exports = function(server) {
    // Add handler for HTTPS (which issues a CONNECT to the proxy)
    server.addListener('connect', httpsConnectHandler);
  };

  function httpsConnectHandler(request, socketRequest, bodyhead) {
    if (debug) {
      console.log("HTTPS Request!!!");
    }

    var url = request.url;
    var httpVersion = request.httpVersion;
    var hostport = getHostPortFromString(url, 443);

    if (debug) {
      console.log("Will connect to " + hostport[0] + ":" + hostport[1]);
    }
    // Set up TCP connection
    var proxySocket = new net.Socket();
    proxySocket.connect(parseInt(hostport[1]), hostport[0], function() {
      if (debug) {
        console.log("  < connected to %s/%s", hostport[0], hostport[1]);
        console.log("  > writing head of length %d", bodyhead.length);
      }

      proxySocket.write(bodyhead);

      // Tell the caller the connection was successfully established
      socketRequest.write("HTTP/" + httpVersion + " 200 Connection " +
        "established\r\n\r\n");
    });

    proxySocket.on("data", function(chunk) {
      if (debug) {
        console.log("  < data length = %d", chunk.length);
      }
      socketRequest.write( chunk );
    });

    proxySocket.on("end", function() {
      if (debug) {
        console.log("  < end");
      }
      socketRequest.end();
    });

    socketRequest.on("data", function(chunk) {
      if (debug) {
        console.log("  > data length = %d", chunk.length);
      }
      proxySocket.write(chunk);
    });

    socketRequest.on("end", function() {
      if (debug) {
        console.log( '  > end' );
      }
      proxySocket.end();
    });

    proxySocket.on("error", function(err) {
      socketRequest.write("HTTP/" + httpVersion + " 500 Connection error" +
        "\r\n\r\n");

      if (debug) {
        console.log("  < ERR: %s", err);
      }
      socketRequest.end();
    });

    socketRequest.on("error", function ( err ) {
      if (debug) {
        console.log( '  > ERR: %s', err );
      }
      proxySocket.end();
    });
  }

  function getHostPortFromString(hostString, defaultPort) {
    var regex_hostport = /^([^:]+)(:([0-9]+))?$/;

    var host = hostString;
    var port = defaultPort;

    var result = regex_hostport.exec(hostString);
    if (result) {
      host = result[1];
      if (result[2]) {
        port = result[3];
      }
    }

    return([ host, port ]);
  }

}());
