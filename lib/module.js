'use strict';

var easyrtc = require('easyrtc');

/**
 *
 * @param {hash} dependencies
 * @return {*}
 */
module.exports = function(dependencies) {

  var config = dependencies('config')('default');
  var conference = dependencies('conference');
  var logger = dependencies('logger');

  var webrtcserver = {
    started: false,
    pub: null
  };

  var start = function(webserver, wsserver, callback) {
    if (webrtcserver.started) {
      return callback();
    }

    if (!webserver || !wsserver) {
      return callback(new Error('Webserver and Websocket server are required'));
    }

    var options = {
      logLevel: config.webrtc.level ||  'info',
      appDefaultName: config.appname || 'WebRTCApp',
      demosEnable: false
    };

    var onAuthenticate = require('./auth/token')(dependencies);

    easyrtc.events.on('authenticate', onAuthenticate);

    easyrtc.events.on('disconnect', function() {
      logger.debug('EasyRTC Disconnect');
    });

    easyrtc.listen(webserver, wsserver, options, function(err, pub) {
      if (err) {
        return callback(err);
      }
      webrtcserver.pub = pub;
      webrtcserver.started = true;

      var connect = pub.events.defaultListeners.connection;
      var disconnect = pub.events.defaultListeners.disconnect;
      var roomJoin = pub.events.defaultListeners.roomJoin;
      var roomLeave = pub.events.defaultListeners.roomLeave;
      var roomCreate = pub.events.defaultListeners.roomCreate;

      easyrtc.events.on('roomCreate', function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        logger.debug('EasyRTC Room create ' + roomName);
        return roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
      });

      easyrtc.events.on('connection', function(socket, easyrtcid, next) {
        logger.debug('EasyRTC Connection ' + easyrtcid);
        return connect(socket, easyrtcid, next);
      });

      easyrtc.events.on('disconnect', function(connectionObj, next) {
        logger.debug('EasyRTC disconnect from user ' + connectionObj.getUsername());
        return disconnect(connectionObj, next);
      });

      easyrtc.events.on('roomJoin', function(connectionObj, roomName, roomParameter, callback) {
        logger.debug('EasyRTC User ' + connectionObj.getUsername() + ' is joining room ' + roomName);
        if (conference.onRoomJoin) {
          return conference.onRoomJoin(roomName, connectionObj.getUsername(), function(err) {
            if (err) {
              logger.error('EasyRTC ERROR While joining the room ' + roomName, err);
            }
            roomJoin(connectionObj, roomName, roomParameter, callback);
          });
        }
        roomJoin(connectionObj, roomName, roomParameter, callback);
      });

      easyrtc.events.on('roomLeave', function(connectionObj, roomName, next) {
        logger.debug('EasyRTC User ' + connectionObj.getUsername() + ' is leaving room ' + roomName);
        if (conference.onRoomLeave) {
          return conference.onRoomLeave(roomName, connectionObj.getUsername(), function(err) {
            if (err) {
              logger.error('EasyRTC ERROR While leaving the room ' + roomName, err);
            }
            return roomLeave(connectionObj, roomName, next);
          });
        }
        roomLeave(connectionObj, roomName, next);
      });

      return callback();
    });
  };

  webrtcserver.start = start;

  return webrtcserver;
};
