'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var PREFIX = 'linagora.io.';

var webrtcModule = new AwesomeModule(PREFIX + 'webrtc', {
  dependencies: [
    new Dependency(Dependency.TYPE_ABILITY, 'webserver', 'webserver'),
    new Dependency(Dependency.TYPE_ABILITY, 'wsserver', 'wsserver'),
    new Dependency(Dependency.TYPE_ABILITY, 'conference', 'conference'),
    new Dependency(Dependency.TYPE_ABILITY, 'config', 'config'),
    new Dependency(Dependency.TYPE_ABILITY, 'logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'hublin-easyrtc-connector', 'connector')
  ],

  states: {
    lib: function(dependencies, callback) {
      var lib = require('./module')(dependencies);
      return callback(null, lib);
    },

    start: function(dependencies, callback) {

      var config = dependencies('config')('default');
      var logger = dependencies('logger');

      if (!config.webrtc.enabled) {
        logger.warn('The webrtc server will not start as expected by the configuration.');
        return callback();
      }

      if (!config.wsserver.enabled || !config.webserver.enabled) {
        logger.warn('The webrtc server can not be started when Websocket and Web server are not activated');
        return callback();
      }

      var wsserver = dependencies('wsserver').server.io;
      var webserver = dependencies('webserver').application;

      this.start(webserver, wsserver, function(err) {
        if (err) {
          logger.warn('webrtc server failed to start', err);
        }
        callback.apply(this, arguments);
      });
    }
  }
});

/**
 *
 * @type {AwesomeModule}
 */
module.exports = webrtcModule;
