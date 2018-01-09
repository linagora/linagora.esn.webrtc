'use strict';

var WebRTCServer = require('./WebRTCServer');
/**
 *
 * @param {hash} dependencies
 * @return {*}
 */
module.exports = function(dependencies) {
  var config = dependencies('config')('default');
  var EasyRTCAdapter = dependencies('connector').lib.adapter;
  var webrtcserver = { started: false, pub: null};

  var start = function(webserver, wsserver, callback) {
    if (webrtcserver.started) {
      return callback();
    }

    if (!webserver || !wsserver) {
      return callback(new Error('Webserver and Websocket server are required'));
    }

    var webrtcConfig = config.webrtc || {};
    var options = {
      logLevel: webrtcConfig.level || 'info',
      appDefaultName: webrtcConfig.appname || 'WebRTCApp',
      demosEnable: false
    };

    if (webrtcConfig.roomNameRegExp) {
      options.roomNameRegExp = new RegExp(webrtcConfig.roomNameRegExp, 'i');
    }

    if (webrtcConfig.usernameRegExp) {
      options.usernameRegExp = new RegExp(webrtcConfig.usernameRegExp, 'i');
    }

    var server = new WebRTCServer(dependencies, new EasyRTCAdapter(), webrtcConfig);

    server.listen(webserver, wsserver, options, function(err) {
      if (err) { return callback(err); }
      webrtcserver.started = true;
      return callback();
    });
  };

  webrtcserver.start = start;

  return webrtcserver;
};
