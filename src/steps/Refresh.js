const Terraform = require('../apps/Terraform')
const Step = require('../Step')
const _ = require('lodash')
const depurar = require('depurar')
const debug = depurar('frey')
const constants = require('../constants')

class Refresh extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._scroll(`Skipping as there are no install instructions`)
      return cb(null)
    }

    new Terraform().exe({
      args   : { refresh: constants.SHELLARG_PREPEND_AS_IS },
      runtime: this.runtime,
    }, (err, stdout) => {
      if (err) {
        if (`${err.details}`.match(/when there is existing state/)) {
          debug('Ignoring refresh error about missing statefile')
          return cb(null)
        } else if (`${err.details}`.match(/non-existent state file/)) {
          debug('Ignoring refresh error about missing statefile')
          return cb(null)
        } else {
          return cb(err)
        }
      }

      let remoteState = _.get(this.runtime, 'config.infra.terraform.backend')
      if (remoteState) {
        debug({remoteState})
        debug('Refraining form pointing to local state as I found remoteState config')
        this._scroll(`Saved state to remote backend`)
      } else {
        this._scroll(`Saved state to '${this.runtime.config.global.infra_state_file}'`)
      }
      return cb(null)
    })
  }
}

module.exports = Refresh
