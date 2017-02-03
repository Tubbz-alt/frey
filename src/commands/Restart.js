const Ansible = require('../apps/Ansible')
const Command = require('../Command')
const constants = require('../constants')
const _ = require('lodash')
const depurar = require('depurar')

const debug = depurar('frey')

class Restart extends Command {
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
