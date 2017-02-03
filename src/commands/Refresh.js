const Terraform = require('../apps/Terraform')
const Command = require('../Command')
const _ = require('lodash')
const depurar = require('depurar')
const debug = depurar('frey')
const constants = require('../constants')

class Refresh extends Command {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._out(`Skipping as there are no install instructions`)
      return cb(null)
    }

    new Terraform({
      args   : { refresh: constants.SHELLARG_PREPEND_AS_IS },
      runtime: this.runtime,
      cmdOpts: { mode: 'silent' },
    }).exe((err, stdout) => {
      if (err) {
        if (`${err.details}`.match(/when there is existing state/)) {
          debug('Ignoring refresh error about missing statefile')
          return cb(null)
        } else {
          return cb(err)
        }
      }

      this._out(`Saved state to '${this.runtime.config.global.infra_state_file}'`)
      return cb(null)
    })
  }
}

module.exports = Refresh
