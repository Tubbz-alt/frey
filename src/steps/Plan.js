const Terraform = require('../apps/Terraform')
const Step = require('../Step')
const _ = require('lodash')
const constants = require('../constants')

class Plan extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._scroll(`Skipping as there are no infra instructions`)
      return cb(null)
    }

    new Terraform().exe({
      runtime: this.runtime,
      mode   : 'passthru',
      args   : {
        plan   : constants.SHELLARG_PREPEND_AS_IS,
        refresh: 'false',
        out    : this.runtime.config.global.infra_plan_file,
      },
    }, (err, stdout) => {
      if (err) {
        return cb(err)
      }

      this._scroll(`Saved plan as '${this.runtime.config.global.infra_plan_file}'`)

      if (stdout.match(/No changes/)) {
        return cb(null, { add: 0, change: 0, destroy: 0 })
      }

      const match = stdout.match(/(\d+) to add, (\d+) to change, (\d+) to destroy/)
      if (!match) {
        return cb(new Error('Unable to parse add/change/destroy'))
      }

      return cb(null, { add: match[1], change: match[2], destroy: match[3] })
    })
  }
}

module.exports = Plan
