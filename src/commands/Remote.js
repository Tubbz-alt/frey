const TerraformInventory = require('../apps/TerraformInventory')
const Ssh = require('../apps/Ssh')
const Command = require('../Command')
const constants = require('../constants')
const inquirer = require('inquirer')
const async = require('async')
const _ = require('lodash')
const depurar = require('depurar')

const debug = depurar('frey')

class Remote extends Command {
  constructor (name, runtime) {
    super(name, runtime)
    this.boot = [ '_gatherHosts', '_selectHosts' ]
  }

  _gatherHosts (cargo, cb) {
    new TerraformInventory({
      mode   : 'silent',
      args   : { list: constants.SHELLARG_BOOLEAN_FLAG },
      runtime: this.runtime,
    }).exe((err, stdout) => {
      if (err) {
        return cb(err)
      }

      const trimmed = `${stdout}`.trim()
      if (!trimmed) {
        const msg = "Unable to get 'terraformInventory', this is a requirement to determine connection endpoints"
        return cb(new Error(msg))
      }

      const hosts = JSON.parse(trimmed)
      const filteredHosts = {}

      _.forOwn(hosts, (ips, name) => {
        // For google cloud this comes in the form of:
        // {"statuspage":["104.197.75.177"],"statuspage.0":["104.197.75.177"],"type_google_compute_instance":["104.197.75.177"]}
        if (name.indexOf('name_') === -1 && !name.match(/\.\d+$/)) {
          return
        }
        ips.forEach(ip => {
          filteredHosts[ip] = name.replace('name_', '')
        })
      })

      return cb(null, filteredHosts)
    })
  }

  _selectHosts (cargo, cb) {
    // Don't offer a choice if it's just one host
    if (Object.keys(this.bootCargo._gatherHosts).length === 1) {
      let selectedHosts = []
      let ip = Object.keys(this.bootCargo._gatherHosts)[0]
      let hostname = this.bootCargo._gatherHosts[ip]
      selectedHosts.push(ip)
      debug(`Automatically selected host ${hostname} because there is just one`)
      return cb(null, selectedHosts)
    }

    // https://www.npmjs.com/package/inquirer
    const choices = []
    _.forOwn(this.bootCargo._gatherHosts, (hostname, ip) => {
      choices.push({ name: hostname, value: ip })
    })

    const question = { type: 'list', name: 'server', message: 'Select server', choices }
    inquirer.prompt(question, answers => {
      if (!_.has(answers, 'server')) {
        return cb(new Error('No server selected'))
      }
      cb(null, [ answers.server ])
    })
  }

  _ssh (host, cb) {
    const opts = { args: {}, runtime: this.runtime }
    opts.args[host] = constants.SHELLARG_APPEND_AS_IS

    const rcmd = _.get(this.runtime, 'init.cliargs.remote')
    if (rcmd) {
      opts.args[rcmd] = constants.SHELLARG_APPEND_AS_IS
    }

    new Ssh(opts).exe((err, stdout) => {
      if (err) {
        return cb(err)
      }

      return cb(null)
    })
  }

  main (cargo, cb) {
    const hosts = _.cloneDeep(this.bootCargo._selectHosts)

    async.map(hosts, this._ssh.bind(this), (err, results) => {
      if (err) {
        return cb(err)
      }

      this._out(`Closed console to '${hosts.join(', ')}'`)
      return cb(null)
    })
  }
}

module.exports = Remote
