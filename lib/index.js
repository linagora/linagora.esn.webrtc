'use strict';

var AwesomeModule = require('awesome-module');
var Dependency = AwesomeModule.AwesomeModuleDependency;

var PREFIX = 'linagora.esn.';

var webrtcModule = new AwesomeModule(PREFIX + 'webrtc', {
  dependencies: [
    new Dependency(Dependency.TYPE_ABILITY, 'webserver', 'webserver'),
    new Dependency(Dependency.TYPE_ABILITY, 'wsserver', 'wsserver'),
    new Dependency(Dependency.TYPE_ABILITY, 'conference', 'conference'),
    new Dependency(Dependency.TYPE_ABILITY, 'config', 'config'),
    new Dependency(Dependency.TYPE_ABILITY, 'logger', 'logger')
  ],

  states: {
    lib: function(dependencies, callback) {
      callback(null, require('./module')(dependencies));
    },

    start: function(dependencies, callback) {
      const config = dependencies('config')('default');
      const logger = dependencies('logger');

      if (!config.webrtc.enabled) {
        logger.warn('The webrtc server will not start as expected by the configuration.');

        return callback();
      }

      if (!config.wsserver.enabled || !config.webserver.enabled) {
        logger.warn('The webrtc server can not be started when Websocket and Web server are not activated');

        return callback();
      }

      const wsserver = dependencies('wsserver').server.io;
      const webserver = dependencies('webserver').application;

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
