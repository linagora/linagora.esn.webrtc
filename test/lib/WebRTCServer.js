'use strict';

var expect = require('chai').expect;
var events = require('events');

describe('The WebRTCServer module', function() {
  var deps;
  var adapterMock;
  var WebRTCServer;

  function dependencies(name) {
    return deps[name];
  }

  beforeEach(function() {
    WebRTCServer = require('../../lib/WebRTCServer');
    adapterMock = {
      events: new events.EventEmitter()
    };
    deps = {
      logger: {
        log: function() {},
        debug: function() {}
      },
      conference: {
        onRoomJoin: function() {}
      },
      connector: {
        lib: {
          auth: function() {}
        }
      }
    };
  });

  describe('In the log event', function() {
    it('should call the logger', function(done) {
      var logLevel = 'info';
      var logArgs = [1, 2, 3];
      var logMessage = 'The log message';

      deps.logger.log = function(level, format, text, fields, next) {
        expect(level).to.equal(logLevel);
        expect(format).to.equal('WebRTC: %s');
        expect(text).to.equal(logMessage);
        expect(fields).to.equal(logArgs);
        expect(next).to.be.undefined;
        done();
      };
      new WebRTCServer(dependencies, adapterMock);
      adapterMock.events.emit('log', logLevel, logMessage, logArgs);
    });
  });

  describe('In the room:join event', function() {
    it('should call conference.onRoomJoin when someone joins an webrtc room', function(done) {

      new WebRTCServer(dependencies, adapterMock);
      adapterMock.events.emit('room:join', {getUsername: function() {}}, 'myroom', {});
      expect(deps.conference.onRoomJoin).to.be.called;
      done();
    });
  });

});
