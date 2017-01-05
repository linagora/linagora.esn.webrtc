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
        onRoomJoin: function() {},
        onRoomLeave: function() {}
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

  it('should call conference.onRoomJoin when someone joins an webrtc room', function(done) {

    new WebRTCServer(dependencies, adapterMock);
    adapterMock.events.emit('room:join', {getUsername: function() {}}, 'myroom', {});
    expect(deps.conference.onRoomJoin).to.be.called;
    done();
  });

  it('should call conference.onRoomLeave when someone leaves an webrtc room', function(done) {

    new WebRTCServer(dependencies, adapterMock);
    adapterMock.events.emit('room:leave', {getUsername: function() {}}, 'myroom', {});
    expect(deps.conference.onRoomJoin).to.be.called;
    done();
  });

  describe('on iceconfig event', function() {

    it('should send back empty array when no options are defined', function(done) {
      new WebRTCServer(dependencies, adapterMock);
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals([]);
        done();
      });
    });

    it('should send back empty array when not defined in options', function(done) {
      new WebRTCServer(dependencies, adapterMock, {});
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals([]);
        done();
      });
    });

    it('should send back ice config when defined in options', function(done) {
      var options = {
        appIceServers: ['stun', 'turn']
      };

      new WebRTCServer(dependencies, adapterMock, options);
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals(options.appIceServers);
        done();
      });
    });
  });
});
