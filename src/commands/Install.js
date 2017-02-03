const Ansible = require('../apps/Ansible')
const Command = require('../Command')
const _ = require('lodash')
const depurar = require('depurar')
const debug = depurar('frey')
const constants = require('../constants')

class Install extends Command {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'install.playbooks')) {
      debug('Skipping as there are no install instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.install_file] = constants.SHELLARG_APPEND_AS_IS

    new Ansible(opts).exe(cb)
  }
}

module.exports = Install
