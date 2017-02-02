const Ansible = require('../apps/Ansible')
const Command = require('../Command')
const _ = require('lodash')
const constants = require('../constants')
const depurar = require('depurar')
const debug = depurar('frey')

class Backup extends Command {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'backup.playbooks')) {
      debug('Skipping as there are no backup instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.backup_file] = constants.SHELLARG_APPEND_AS_IS

    const ansible = new Ansible(opts)
    ansible.exe(cb)
  }
}

module.exports = Backup
