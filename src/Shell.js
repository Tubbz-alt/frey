// const depurar = require('depurar')
// const debug = depurar('frey')
// const chalk = require('chalk')
// import { spawn } from 'child_process'
const _ = require('lodash')
const inquirer = require('inquirer')
const Base = require('./Base')
// const utils = require('./Utils')

class Shell extends Base {
  constructor (runtime) {
    super()
    this.runtime = runtime
  }

  confirm (question, cb) {
    if (this.runtime.init.cliargs.forceYes) {
      this._scroll(`Skipping confirmation for '${question}' as '--force-yes' applies`)
      return cb(null)
    }

    inquirer.prompt(
      { type: 'confirm', name: 'confirmation', message: question, default: false },
      answers => {
        if (_.get(answers, 'confirmation') !== true) {
          return cb(new Error('Question declined. Aborting. '))
        }

        return cb(null)
      }
    )
  }
}

module.exports = Shell
