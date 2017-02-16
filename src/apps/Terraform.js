const chalk = require('chalk')
const _ = require('lodash')
const App = require('../App')
const constants = require('../constants')

class Terraform extends App {
  _appDefaults (userOpts, runtime, cb) {
    const terraformProps = _.find(runtime.deps, { name: 'terraform' })
    const appDefaults = {
      args         : {},
      env          : terraformProps.env || {},
      signatureOpts: { equal: '=', quote: '', dash: '-', escape: false },
      exe          : terraformProps.exe,
    }

    if (!chalk.enabled) {
      appDefaults.args['no-color'] = constants.SHELLARG_BOOLEAN_FLAG
    }

    if (runtime.init.cliargs.verbose) {
      appDefaults.env['TF_LOG'] = 'DEBUG'
    }

    appDefaults.args['parallelism'] = runtime.config.global.terraformcfg.parallelism
    appDefaults.args['state'] = runtime.config.global.infra_state_file

    cb(null, appDefaults)
  }
}

module.exports = Terraform
