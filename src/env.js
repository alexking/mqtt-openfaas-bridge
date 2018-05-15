module.exports = function (name, defaultValue = false) {
  if (typeof process.env[name] !== 'undefined') {
    return process.env[name]
  }

  return defaultValue
}
