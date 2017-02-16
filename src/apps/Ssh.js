const App = require('../App')
const constants = require('../constants')

class Ssh extends App {
  _appDefaults (userOpts, runtime, cb) {
    const appDefaults = {
      args         : {},
      env          : {},
      signatureOpts: { equal: '', quote: '', dash: '-', escape: false },
      stdio        : [process.stdin, process.stdout, process.stderr],
      exe          : 'ssh',
    }

    appDefaults.args['i'] = runtime.config.global.ssh.privatekey_file
    appDefaults.args['l'] = runtime.config.global.ssh.user

    appDefaults.args['-oUserKnownHostsFile=/dev/null'] = constants.SHELLARG_PREPEND_AS_IS
    appDefaults.args['-oCheckHostIP=no'] = constants.SHELLARG_PREPEND_AS_IS
    appDefaults.args['-oStrictHostKeyChecking=no'] = constants.SHELLARG_PREPEND_AS_IS

    if (runtime.init.cliargs.verbose) {
      appDefaults.args['vvvv'] = constants.SHELLARG_BOOLEAN_FLAG
    }

    cb(null, appDefaults)
  }
}

module.exports = Ssh
