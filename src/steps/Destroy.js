const Terraform = require('../apps/Terraform')
const Step = require('../Step')
const _ = require('lodash')
const utils = require('../Utils')
const constants = require('../constants')

// const debug = require('depurar')('frey')
class Destroy extends Step {
  constructor (name, runtime) {
    super(name, runtime)
    this.boot = ['_confirm']
  }

  _confirm (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._scroll(`Skipping as there are no install instructions`)
      return cb(null)
    }
    utils.confirm('May I destroy your infrastructure?', this.runtime.init.cliargs.forceYes, cb)
  }

  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._scroll(`Skipping as there are no install instructions`)
      return cb(null)
    }

    new Terraform().exe({
      args   : { destroy: constants.SHELLARG_PREPEND_AS_IS, force: constants.SHELLARG_BOOLEAN_FLAG },
      runtime: this.runtime,
    }, (err, stdout) => {
      if (err) {
        return cb(err)
      }

      this._scroll(`Saved new state to '${this.runtime.config.global.infra_state_file}'`)

      return cb(null)
    })
  }
}

module.exports = Destroy
