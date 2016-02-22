(function() {
  "use strict";

  var net = require("net");

  module.exports = function(server) {
    // add handler for HTTPS (which issues a CONNECT to the proxy)
    server.addListener('connect', httpsConnectHandler);
  };

  function httpsConnectHandler(request, socketRequest, bodyhead) {
    console.log("HTTPS Request!!!");
  }

  //function httpsConnectHandler(request, socketRequest, bodyhead) {
  //  var url = request['url'];
  //  var httpVersion = request['httpVersion'];
  //
  //  var hostport = getHostPortFromString( url, 443 );
  //
  //  if ( debugging )
  //    console.log( '  = will connect to %s:%s', hostport[0], hostport[1] );
  //
  //  // set up TCP connection
  //  var proxySocket = new net.Socket();
  //  proxySocket.connect(
  //    parseInt( hostport[1] ), hostport[0],
  //    function () {
  //      if ( debugging )
  //        console.log( '  < connected to %s/%s', hostport[0], hostport[1] );
  //
  //      if ( debugging )
  //        console.log( '  > writing head of length %d', bodyhead.length );
  //
  //      proxySocket.write( bodyhead );
  //
  //      // tell the caller the connection was successfully established
  //      socketRequest.write( "HTTP/" + httpVersion + " 200 Connection established\r\n\r\n" );
  //    }
  //  );
  //
  //  proxySocket.on(
  //    'data',
  //    function ( chunk ) {
  //      if ( debugging )
  //        console.log( '  < data length = %d', chunk.length );
  //
  //      socketRequest.write( chunk );
  //    }
  //  );
  //
  //  proxySocket.on(
  //    'end',
  //    function () {
  //      if ( debugging )
  //        console.log( '  < end' );
  //
  //      socketRequest.end();
  //    }
  //  );
  //
  //  socketRequest.on(
  //    'data',
  //    function ( chunk ) {
  //      if ( debugging )
  //        console.log( '  > data length = %d', chunk.length );
  //
  //      proxySocket.write( chunk );
  //    }
  //  );
  //
  //  socketRequest.on(
  //    'end',
  //    function () {
  //      if ( debugging )
  //        console.log( '  > end' );
  //
  //      proxySocket.end();
  //    }
  //  );
  //
  //  proxySocket.on(
  //    'error',
  //    function ( err ) {
  //      socketRequest.write( "HTTP/" + httpVersion + " 500 Connection error\r\n\r\n" );
  //      if ( debugging ) {
  //        console.log( '  < ERR: %s', err );
  //      }
  //      socketRequest.end();
  //    }
  //  );
  //
  //  socketRequest.on(
  //    'error',
  //    function ( err ) {
  //      if ( debugging ) {
  //        console.log( '  > ERR: %s', err );
  //      }
  //      proxySocket.end();
  //    }
  //  );
  //}
  //
  //function getHostPortFromString( hostString, defaultPort ) {
  //  var host = hostString;
  //  var port = defaultPort;
  //
  //  var result = regex_hostport.exec( hostString );
  //  if ( result != null ) {
  //    host = result[1];
  //    if ( result[2] != null ) {
  //      port = result[3];
  //    }
  //  }
  //
  //  return( [ host, port ] );
  //}

}());
