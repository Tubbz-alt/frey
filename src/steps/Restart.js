const Ansible = require('../apps/Ansible')
const Step = require('../Step')
const constants = require('../constants')
const _ = require('lodash')
const depurar = require('depurar')

const debug = depurar('frey')

class Restart extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'restart.playbooks')) {
      debug('Skipping as there are no restart instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.restart_file] = constants.SHELLARG_APPEND_AS_IS

    new Ansible(opts).exe(cb)
  }
}

module.exports = Restart
