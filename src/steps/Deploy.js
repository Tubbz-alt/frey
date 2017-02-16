const Ansible = require('../apps/Ansible')
const Step = require('../Step')
const _ = require('lodash')
const constants = require('../constants')
const depurar = require('depurar')
const debug = depurar('frey')

class Deploy extends Step {
  main (cargo, cb) {
    if (!_.has(this.runtime.config, 'deploy.playbooks')) {
      debug('Skipping as there are no deploy instructions')
      return cb(null)
    }

    const opts = { args: {}, runtime: this.runtime }

    opts.args[this.runtime.config.global.deploy_file] = constants.SHELLARG_APPEND_AS_IS

    new Ansible(opts).exe(cb)
  }
}

module.exports = Deploy
