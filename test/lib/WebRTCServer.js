'use strict';

const { expect } = require('chai');
const events = require('events');
const mockery = require('mockery');
const FakeWebRTCAdapter = require('../fixtures/adapter');

describe('The WebRTCServer module', function() {
  var deps;
  var adapterMock;
  var WebRTCServer;

  function dependencies(name) {
    return deps[name];
  }

  beforeEach(function() {
    mockery.registerMock('./registry', {
      get: () => ({WebRTCAdapter: FakeWebRTCAdapter})
    });
  });

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
      deps['esn-config'] = () => ({
        get: function(callback) {
          callback();
        }
      });

      new WebRTCServer(dependencies, adapterMock);
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals([]);
        done();
      });
    });

    it('should send back empty array when not defined in options', function(done) {
      deps['esn-config'] = () => ({
        get: function(callback) {
          callback(null, {});
        }
      });

      new WebRTCServer(dependencies, adapterMock, null, {});
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals([]);
        done();
      });
    });

    it('should send back ice config when defined in options', function(done) {
      const servers = ['stun', 'turn'];

      deps['esn-config'] = () => ({
        get: function(callback) {
          callback(null, {servers});
        }
      });

      new WebRTCServer(dependencies, adapterMock, null, {});
      adapterMock.events.emit('iceconfig', {}, function(err, config) {
        expect(err).to.be.null;
        expect(config).to.deep.equals(servers);
        done();
      });
    });
  });
});
