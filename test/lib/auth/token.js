'use strict';

var expect = require('chai').expect;

describe('The webrtc server module token auth middleware', function() {

  it('should return next() without argument if socket got a userId property', function(done) {

    var deps = function(name) {
      expect(name).to.equal('wsserver');
      return {
        helper: {
          getUserId: function(socket) {
            return 1;
          }
        }
      };
    };

    var authmw = require('../../../lib/auth/token')(deps);

    var socket = {
      request: {
        userId: 'Johnny'
      }
    };
    authmw(socket, null, null, null, null, null, function(arg) {
      expect(arg).to.be.null;
      done();
    });
  });

  it('should return next(err) if socket do not have a userId property', function(done) {
    var deps = function(name) {
      expect(name).to.equal('wsserver');
      return {
        helper: {
          getUserId: function(socket) {
            return null;
          }
        }
      };
    };

    var authmw = require('../../../lib/auth/token')(deps);

    authmw({}, null, null, null, null, null, function(err) {
      expect(err).to.be.an('Error');
      done();
    });
  });
});
