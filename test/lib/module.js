'use strict';

const expect = require('chai').expect;
const mockery = require('mockery');
const events = require('events');
const FakeWebRTCAdapter = require('../fixtures/adapter');

describe('The webrtc module', function() {
  beforeEach(function() {
    mockery.registerMock('./registry', {
      get: () => ({WebRTCAdapter: FakeWebRTCAdapter})
    });
  });

  it('should contains all needed properties.', function() {
    const dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };
    const deps = function(name) {
      return dependencies[name];
    };
    const server = require('../../lib/module')(deps);

    expect(server.webrtcserver).to.exist;
    expect(server.webrtcserver).to.be.an.Object;
    expect(server.webrtcserver).to.have.property('pub');
    expect(server.webrtcserver.pub).to.be.null;
    expect(server.webrtcserver).to.have.property('started');
    expect(server.webrtcserver.started).to.be.false;
    expect(server.webrtcserver).to.have.property('start');
    expect(server.webrtcserver.start).to.be.a.Function;
  });

  it('should not call webrtc#listen when already started', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    server.started = true;
    server.start(null, null, function() {
      done();
    });

  });

  it('should not call webrtc#listen when webserver is not defined', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    server.started = true;
    server.start(null, {}, function(err) {
      expect(err).to.be.defined;
      done();
    });
  });

  it('should not call webrtc#listen when websocket server is not defined', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    server.started = true;
    server.start(null, {}, function(err) {
      expect(err).to.be.defined;
      done();
    });
  });

  it('should send back error when webrtc#listen fails', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(new Error());
      }
    });

    var dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    server.started = true;
    server.start({}, {}, function(err) {
      expect(err).to.be.defined;
      done();
    });
  });

  it('should be started when webrtc#listen is ok', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(null, {});
      }
    });

    var dependencies = {
      conference: {},
      connector: {lib: {adapter: function() {}}},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    server.started = true;
    server.start({}, {}, function(err) {
      expect(err).to.be.undefined;
      expect(server.started).to.be.true;
      done();
    });
  });

  describe('Regexp Options', function() {

    function mockContext(webrtc) {

      function AdapterMock() {
        this.events = new events.EventEmitter();
      }
      AdapterMock.prototype.listen = function() {};

      var dependencies = {
        conference: {
        },
        config: function() {
          return {
            webrtc: webrtc
          };
        },
        connector: {
          lib: {
            adapter: AdapterMock,
            auth: function() {}
          }
        },
        wsserver: {
          helper: function() {}
        },
        logger: require('../fixtures/logger-noop')()
      };
      var deps = function(name) {
        return dependencies[name];
      };

      var server = require('../../lib/module')(deps);

      return {
        dependencies: dependencies,
        server: server
      };
    }

    function WebRTCServer() {
        this.events = new events.EventEmitter();
    }

    it('should use the usernameRegExp define in configuration when defined', function(done) {

      var regexp = '^(.){1,64}$';

      WebRTCServer.prototype.listen = function(webserver, wsserver, options) {
        expect(options).to.exist;
        expect(options.usernameRegExp).to.exist;
        expect(options.usernameRegExp.toString()).to.equal('/' + regexp + '/i');
        return done();
      };

      mockery.registerMock('./WebRTCServer', WebRTCServer);

      var mock = mockContext({usernameRegExp: regexp});
      mock.server.start({}, {}, function() {
        return done(new Error());
      });
    });

    it('should use the roomNameRegExp define in configuration when defined', function(done) {

      var regexp = '^(.){1,64}$';

      WebRTCServer.prototype.listen = function(webserver, wsserver, options) {
        expect(options).to.exist;
        expect(options.roomNameRegExp).to.exist;
        expect(options.roomNameRegExp.toString()).to.equal('/' + regexp + '/i');
        return done();
      };

      mockery.registerMock('./WebRTCServer', WebRTCServer);

      var mock = mockContext({roomNameRegExp: regexp});
      mock.server.start({}, {}, function() {
        return done(new Error());
      });
    });
  });
});
