const WebRTCServer = require('./WebRTCServer');
const registry = require('./registry');

module.exports = dependencies => {
  const webrtcserver = { started: false, pub: null, start};

  return {
    start,
    registry,
    webrtcserver
  };

  function start(webserver, wsserver, callback) {
    if (webrtcserver.started) {
      return callback();
    }

    if (!webserver || !wsserver) {
      return callback(new Error('Webserver and Websocket server are required'));
    }

    const config = dependencies('config')('default');
    const webrtcConfig = (config && config.webrtc) || {};
    const adapter = registry.get(webrtcConfig.adapter);

    if (!adapter) {
      return callback(new Error(`Can not find WebRTC adapter ${webrtcConfig.adapter} in registry`));
    }

    const options = {
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

    const webRTCAdapter = new adapter.WebRTCAdapter({dependencies, webrtcConfig});
    const server = new WebRTCServer(dependencies, webRTCAdapter, adapter.onAuthenticate, webrtcConfig);

    server.listen(webserver, wsserver, options, err => {
      if (err) { return callback(err); }
      webrtcserver.started = true;

      callback();
    });
  }
};
