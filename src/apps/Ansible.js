const chalk = require('chalk')
const _ = require('lodash')
const App = require('../App')
const fs = require('fs')
const constants = require('../constants')

class Ansible extends App {
  _appDefaults (userOpts, runtime, cb) {
    const terraformInvProps = _.find(runtime.deps, { name: 'terraformInventory' })
    const ansibleProps = _.find(runtime.deps, { name: 'ansible' })
    const appDefaults = {
      args         : {},
      cwd          : runtime.init.cliargs.projectDir,
      env          : ansibleProps.env || {},
      signatureOpts: { equal: '=', quote: '', dash: '--', escape: false },
      exe          : ansibleProps.exePlaybook,
      cbPreLinefeed: function (type, line, { flush = false, code = undefined }, callback) {
        // @todo Ansible command output parsing is very basic, we can do a better job
        if (this._opts.mode === 'passthru') {
          return callback(null, line)
        }
        let modifiedLine = line
        let matches = false

        matches = modifiedLine.match(/([a-zA-Z0-9]+)?\s*\[([^\]]+)\]\s*\*{3,}\s*$/)
        if (matches) {
          this._opts.extraComponents = [ 'ansible', matches[1], matches[2] ]
          modifiedLine = null // <-- don't output this line
        }

        return callback(null, modifiedLine)
      },
    }

    appDefaults.args['inventory-file'] = terraformInvProps.exe
    appDefaults.args['user'] = runtime.config.global.ssh.user
    appDefaults.args['private-key'] = runtime.config.global.ssh.privatekey_file

    if (runtime.init.cliargs.tags) {
      appDefaults.args['tags'] = runtime.init.cliargs.tags
    }

    if (runtime.init.cliargs.verbose) {
      appDefaults.args['-vvvv'] = constants.SHELLARG_APPEND_AS_IS
    }

    // @todo: Put in a JS date here if you want the same stamp on all machines in a cluster.
    // Also, make it so that extra-vars can be appended vs
    // overwritten further down already
    // appDefaults.args['extra-vars'] = 'ansistrano_release_version=$(date -u +%Y%m%d%H%M%SZ)'
    const connection = _.get(runtime, 'config.global.connection')
    if (connection !== undefined) {
      if (connection === 'local') {
        appDefaults.args['connection'] = 'local'
        appDefaults.args['extra-vars'] = `variable_host=${connection}`
        appDefaults.args['inventory-file'] = `${connection},`
        appDefaults.args['user'] = constants.SHELLARG_REMOVE
        appDefaults.args['private-key'] = constants.SHELLARG_REMOVE
      } else {
        const hostFile = '/tmp/anshosts'
        fs.writeFileSync(hostFile, `${connection}\n`, 'utf-8')
        appDefaults.args['inventory-file'] = hostFile
      }
    } else {
      fs.stat(runtime.config.global.infra_state_file, err => {
        if (err) {
          return cb(new Error(
            `Can't find infra_state_file '${runtime.config.global.infra_state_file}'. Did you provision infra yet? `
          ))
        }
      })
    }

    if (!chalk.enalbed) {
      appDefaults.env.ANSIBLE_NOCOLOR = 'true'
    }

    appDefaults.env.ANSIBLE_CONFIG = runtime.config.global.ansiblecfg_file
    appDefaults.env.TF_STATE = runtime.config.global.infra_state_file

    // The limit option tells Ansible to target only certain hosts.
    // if (runtime.init.cliargs.limit) {
    //   args.push(`limit=${runtime.init.cliargs.limit}`)
    // }
    //
    cb(null, appDefaults)
  }
}

module.exports = Ansible
