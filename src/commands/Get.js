const Terraform = require('../apps/Terraform')
const Command = require('../Command')
const _ = require('lodash')
const constants = require('../constants')

class Get extends Command {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'infra')) {
      this._out(`Skipping as there are no infra instructions`)
      return cb(null)
    }

    const terraform = new Terraform({
      args: {
        get        : constants.SHELLARG_PREPEND_AS_IS,
        state      : constants.SHELLARG_REMOVE,
        parallelism: constants.SHELLARG_REMOVE,
        update     : true,
      },
      runtime: this.runtime,
    })

    terraform.exe((err, stdout) => {
      if (err) {
        return cb(err)
      }

      this._out(`Updated modules'`)
      return cb(null)
    })
  }
}

module.exports = Get
