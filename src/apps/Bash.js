const App       = require('../App')
const constants = require('../constants')

class Bash extends App {
  exe (cb) {
    const defaults = {
      args: {
        'e': constants.SHELLARG_BOOLEAN_FLAG,
        'u': constants.SHELLARG_BOOLEAN_FLAG,
        'c': constants.SHELLARG_BOOLEAN_FLAG,
      },
      env          : {},
      signatureOpts: { equal: '', quote: '', dash: '-', escape: false },
      exe          : 'bash',
      stdio        : ['pipe', 'pipe', 'pipe'],
    }

    defaults.args[this.opts.script] = constants.SHELLARG_APPEND_AS_IS

    this._exe(defaults, cb)
  }
}

module.exports = Bash
