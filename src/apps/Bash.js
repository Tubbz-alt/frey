const App = require('../App')
const constants = require('../constants')

class Bash extends App {
  _appDefaults (userOpts, runtime, cb) {
    const appDefaults = {
      args: {
        e: constants.SHELLARG_BOOLEAN_FLAG,
        u: constants.SHELLARG_BOOLEAN_FLAG,
        c: constants.SHELLARG_BOOLEAN_FLAG,
      },
      env          : {},
      signatureOpts: { equal: '', quote: '', dash: '-', escape: false },
      exe          : 'bash',
      stdio        : ['pipe', 'pipe', 'pipe'],
    }

    appDefaults.args[userOpts.script] = constants.SHELLARG_APPEND_AS_IS

    cb(null, appDefaults)
  }
}

module.exports = Bash
