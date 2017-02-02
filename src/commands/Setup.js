const Ansible = require('../apps/Ansible')
const Command = require('../Command')
const constants = require('../constants')
const _ = require('lodash')
const depurar = require('depurar')

const debug = depurar('frey')

class Setup extends Command {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'setup.playbooks')) {
      debug('Skipping as there are no setup instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.setup_file] = constants.SHELLARG_APPEND_AS_IS

    const ansible = new Ansible(opts)
    ansible.exe(cb)
  }
}

module.exports = Setup
