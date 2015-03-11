'use strict';

var expect = require('chai').expect,
  mockery = require('mockery');

describe('The webrtc module', function() {

  it('should contains all needed properties.', function() {

    var dependencies = {
      conference: {},
      config: function() {}
    };

    var deps = function(name) {
      return dependencies[name];
    };

    var server = require('../../lib/module')(deps);
    expect(server).to.exist;
    expect(server).to.be.an.Object;
    expect(server).to.have.property('pub');
    expect(server.pub).to.be.null;
    expect(server).to.have.property('started');
    expect(server.started).to.be.false;
    expect(server).to.have.property('start');
    expect(server.start).to.be.a.Function;
  });

  it('should not call easyrtc#listen when already started', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
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

  it('should not call easyrtc#listen when webserver is not defined', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
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

  it('should not call easyrtc#listen when websocket server is not defined', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function() {
        return done(new Error());
      }
    });

    var dependencies = {
      conference: {},
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

  it('should send back error when easyrtc#listen fails', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(new Error());
      }
    });

    var dependencies = {
      conference: {},
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

  it('should be started when easyrtc#listen is ok', function(done) {
    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(null, {});
      }
    });

    var dependencies = {
      conference: {},
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

  it('should call conference.onRoomJoin when someone joins an easyrtc room', function(done) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();

    var pub = {
      events: {
        defaultListeners: {
          roomJoin: function(connectionObj, roomName, roomParameter, callback) {
            return callback();
          }
        }
      }
    };
    pub.events._eventListener = eventEmitter;
    pub.events.emit = pub.events._eventListener.emit.bind(pub.events._eventListener);

    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(null, pub);
      },
      events: pub.events._eventListener
    });

    var dependencies = {
      conference: {
        onRoomJoin: function() {
          return done();
        }
      },
      config: function() {
        return {
          webrtc: {
          }
        };
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
    server.start({}, {}, function(err) {
      expect(err).to.not.exist;
      eventEmitter.emit('roomJoin', {
        getUsername: function() {
        }
      }, 'myroom', {}, function() {
      });
    });
  });

  it('should call conference.onRoomLeave when someone leaves an easyrtc room', function(done) {
    var events = require('events');
    var eventEmitter = new events.EventEmitter();

    var pub = {
      events: {
        defaultListeners: {
          roomLeave: function(connectionObj, roomName, next) {
            return next();
          }
        }
      }
    };
    pub.events._eventListener = eventEmitter;
    pub.events.emit = pub.events._eventListener.emit.bind(pub.events._eventListener);

    mockery.registerMock('easyrtc', {
      listen: function(web, ws, options, callback) {
        return callback(null, pub);
      },
      events: pub.events._eventListener
    });


    var dependencies = {
      conference: {
        onRoomLeave: function() {
          return done();
        }
      },
      config: function() {
        return {
          webrtc: {
          }
        };
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
    //server.started = true;
    server.start({}, {}, function(err) {
      expect(err).to.not.exist;
      eventEmitter.emit('roomLeave', {
        getUsername: function() {
        }
      }, 'myroom', {}, function() {
      });
    });
  });

  describe('Regexp Options', function() {

    function mockContext(webrtc) {

      var dependencies = {
        conference: {
        },
        config: function() {
          return {
            webrtc: webrtc
          };
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

    it('should use the usernameRegExp define in configuration when defined', function(done) {

      var regexp = '^(.){1,64}$';

      mockery.registerMock('easyrtc', {
        listen: function(webserver, wsserver, options, callback) {
          expect(options).to.exist;
          expect(options.usernameRegExp).to.exist;
          expect(options.usernameRegExp.toString()).to.equal('/' + regexp + '/i');
          return done();
        },

        events: {
          on: function() {}
        }
      });

      var mock = mockContext({usernameRegExp: regexp});
      mock.server.start({}, {}, function() {
        return done(new Error());
      });
    });

    it('should use the roomNameRegExp define in configuration when defined', function(done) {

      var regexp = '^(.){1,64}$';

      mockery.registerMock('easyrtc', {
        listen: function(webserver, wsserver, options, callback) {
          expect(options).to.exist;
          expect(options.roomNameRegExp).to.exist;
          expect(options.roomNameRegExp.toString()).to.equal('/' + regexp + '/i');
          return done();
        },

        events: {
          on: function() {}
        }
      });

      var mock = mockContext({roomNameRegExp: regexp});
      mock.server.start({}, {}, function() {
        return done(new Error());
      });
    });
  });
});
