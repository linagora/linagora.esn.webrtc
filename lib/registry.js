const adapters = new Map();

module.exports = {
  register,
  get
};

function register(name, _adapter) {
  adapters.set(name, _adapter);
}

function get(name) {
  return adapters.get(name);
}
