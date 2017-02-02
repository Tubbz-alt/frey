// const chalk = require('chalk')
const _ = require('lodash')
const App = require('../App')
// const constants = require('../constants')
class TerraformInventory extends App {
  exe (cb) {
    const terraformInventoryProps = _.find(this.runtime.deps, { name: 'terraformInventory' })
    const defaults = {
      args         : {},
      env          : terraformInventoryProps.env || {},
      signatureOpts: { equal: '=', quote: '', dash: '-', escape: false },
      exe          : terraformInventoryProps.exe,
    }

    defaults.env.TF_STATE = this.runtime.config.global.infra_state_file

    this._exe(defaults, cb)
  }
}

module.exports = TerraformInventory
