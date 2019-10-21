const Terraform = require('../apps/Terraform')
const Step = require('../Step')
const _ = require('lodash')
const constants = require('../constants')
const utils = require('../Utils')

class Infra extends Step {
  constructor (name, runtime) {
    super(name, runtime)
    this.boot = ['_confirm']
  }

  _confirm (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._stick(`Skipping as there are no install instructions`)
      return cb(null)
    }

    if (!_.has(this.runtime, 'plan.change')) {
      return cb(new Error('Unable to find infra plan. This is step is required to launch infra. '))
    }

    if (this.runtime.plan.change > 0 || this.runtime.plan.destroy > 0) {
      return utils.confirm('This infra change is destructive in nature, may I proceed?', this.runtime.init.cliargs.forceYes, cb)
    } else {
      return cb(null)
    }
  }

  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._stick(`Skipping as there are no install instructions`)
      return cb(null)
    }

    new Terraform().exe({
      args: {
        apply          : constants.SHELLARG_PREPEND_AS_IS,
        '-auto-approve': this.runtime.init.cliargs.forceYes,
      },
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

module.exports = Infra
