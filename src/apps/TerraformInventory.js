// const chalk = require('chalk')
const _ = require('lodash')
const App = require('../App')
// const constants = require('../constants')
class TerraformInventory extends App {
  _appDefaults (userOpts, runtime, cb) {
    const terraformInventoryProps = _.find(runtime.deps, { name: 'terraformInventory' })
    const appDefaults = {
      args         : {},
      env          : terraformInventoryProps.env || {},
      cwd          : runtime.init.cliargs.projectDir,
      signatureOpts: { equal: '=', quote: '', dash: '-', escape: false },
      exe          : terraformInventoryProps.exe,
    }

    appDefaults.env.TF_STATE = runtime.config.global.infra_state_file

    cb(null, appDefaults)
  }
}

module.exports = TerraformInventory
