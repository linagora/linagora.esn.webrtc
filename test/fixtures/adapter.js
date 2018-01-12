const { EventEmitter } = require('events');

class FakeWebRTCAdapter extends EventEmitter {
  constructor() {
    super();
    this.events = this;
  }

  /* eslint class-methods-use-this: 0 */
  listen(webserver, wsserver, options, callback) {
    /* eslint no-console: 0 */
    console.log('Listen WebRTC Events');
    callback();
  }
}

module.exports = FakeWebRTCAdapter;
