const chalk = require('chalk')
const _ = require('lodash')
const debug = require('depurar')('frey')
const App = require('../App')
const constants = require('../constants')

class Terraform extends App {
  _appDefaults (userOpts, runtime, cb) {
    const terraformProps = _.find(runtime.deps, { name: 'terraform' })
    const appDefaults = {
      args         : {},
      env          : terraformProps.env || {},
      cwd          : runtime.init.cliargs.projectDir,
      signatureOpts: { equal: '=', quote: '', dash: '-', escape: false },
      exe          : terraformProps.exe,
    }

    if (!chalk.enabled) {
      appDefaults.args['no-color'] = constants.SHELLARG_BOOLEAN_FLAG
    }

    if (runtime.init.cliargs.verbose) {
      appDefaults.env['TF_LOG'] = 'DEBUG'
    }

    if (runtime.init.cliargs.target) {
      appDefaults.args['target'] = runtime.init.cliargs.target
    }

    appDefaults.args['parallelism'] = runtime.config.global.terraformcfg.parallelism

    let remoteState = _.get(runtime, 'config.infra.terraform.backend')
    if (remoteState) {
      debug({remoteState})
      debug(`Refraining form pointing to local state as I found remote backend`)
    } else {
      appDefaults.args['state'] = runtime.config.global.infra_state_file
    }

    cb(null, appDefaults)
  }
}

module.exports = Terraform
