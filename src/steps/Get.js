const Terraform = require('../apps/Terraform')
const Step = require('../Step')
const _ = require('lodash')
const constants = require('../constants')

class Get extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._scroll(`Skipping as there are no infra instructions`)
      return cb(null)
    }

    new Terraform().exe({
      args: {
        get        : constants.SHELLARG_PREPEND_AS_IS,
        state      : constants.SHELLARG_REMOVE,
        parallelism: constants.SHELLARG_REMOVE,
        update     : true,
      },
      runtime: this.runtime,
    }, (err, stdout) => {
      if (err) {
        return cb(err)
      }

      this._scroll(`Updated modules`)
      return cb(null)
    })
  }
}

module.exports = Get
