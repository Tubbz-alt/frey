const Ansible = require('../apps/Ansible')
const Step = require('../Step')
const constants = require('../constants')
const _ = require('lodash')
const depurar = require('depurar')

const debug = depurar('frey')

class Setup extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'setup.playbooks')) {
      debug('Skipping as there are no setup instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.setup_file] = constants.SHELLARG_APPEND_AS_IS

    new Ansible(opts).exe(cb)
  }
}

module.exports = Setup
