'use strict';

function WebRTCServer(dependencies, adapter, onAuthenticate, webrtcConfig) {
  var conference = dependencies('conference');
  var self = this;

  this.adapter = adapter;
  this.logger = adapter.logger || dependencies('logger');
  this.events = adapter.events;

  self.events.on('log', function(level, logText, logFields, next) {
    self.logger.log(level, 'WebRTC: %s', logText, logFields || '');
    if (next && typeof next === 'function') {
      next();
    }
  });

  self.events.on('authenticate', onAuthenticate || (() => this.logger.info('No onAuthenticate handler')));

  self.events.on('iceconfig', function(connectionObj, callback) {
    self.logger.debug('WebRTC Requesting ICE configuration');
    callback(null, webrtcConfig ? webrtcConfig.appIceServers || [] : []);
  });

  self.events.on('connection', function(socket, WebRTCid, next) {
    self.logger.debug('WebRTC Connection ' + WebRTCid);
    return self.adapter.connect(socket, WebRTCid, next);
  });

  self.events.on('disconnect', function(connectionObj, next) {
    self.logger.debug('WebRTC Disconnection from user ' + connectionObj.getUsername());
    return self.adapter.disconnect(connectionObj, next);
  });

  self.events.on('room:create', function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    self.logger.debug('Room create ' + roomName);
    return self.adapter.createRoom(appObj, creatorConnectionObj, roomName, roomOptions, callback);
  });

  self.events.on('room:join', function(connectionObj, roomName, roomParameter, callback) {
    self.logger.debug('User ' + connectionObj.getUsername() + ' is joining room ' + roomName);
    if (conference.onRoomJoin) {
      return conference.onRoomJoin(roomName, connectionObj.getUsername(), function(err) {
        if (err) {
          self.logger.error('WebRTC ERROR While joining the room ' + roomName, err);
        }
        self.adapter.joinRoom(connectionObj, roomName, roomParameter, callback);
      });
    }
    self.adapter.joinRoom(connectionObj, roomName, roomParameter, callback);
  });

  self.events.on('room:leave', function(connectionObj, roomName, next) {
    self.logger.debug('WebRTC User ' + connectionObj.getUsername() + ' is leaving room ' + roomName);
    if (conference.onRoomLeave) {
      return conference.onRoomLeave(roomName, connectionObj.getUsername(), function(err) {
        if (err) {
          self.logger.error('WebRTC ERROR While leaving the room ' + roomName, err);
        }
        return self.adapter.leaveRoom(connectionObj, roomName, next);
      });
    }
    self.adapter.leaveRoom(connectionObj, roomName, next);
  });
}

/**
*
* @param {hash} webserver
* @param {hash} wsserver
* @param {hash} options
* @param {hash} callback
*/
WebRTCServer.prototype.listen = function listen(webserver, wsserver, options, callback) {
  this.adapter.listen(webserver, wsserver, options, callback);
};

/**
*/
module.exports = WebRTCServer;
