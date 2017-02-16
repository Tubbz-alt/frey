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

  // exeScript (scriptArgs, cmdOpts, cb) {
  //   scriptArgs = [ 'bash', '-o', 'pipefail', '-o', 'errexit', '-o', 'nounset', '-c' ].concat(
  //     scriptArgs
  //   )
  //
  //   return this.exe(scriptArgs, cmdOpts, cb)
  // }

  // exe (cmdArgs, cmdOpts = {}, cb) {
  //   if (cmdOpts.env === undefined) {
  //     cmdOpts.env = {}
  //   }
  //   if (cmdOpts.verbose === undefined) {
  //     cmdOpts.verbose = true
  //   }
  //   if (cmdOpts.input === undefined) {
  //     cmdOpts.input = undefined
  //   }
  //   if (cmdOpts.stdin === undefined) {
  //     cmdOpts.stdin = 'ignore'
  //   }
  //   if (cmdOpts.stdout === undefined) {
  //     cmdOpts.stdout = 'pipe'
  //   }
  //   if (cmdOpts.stderr === undefined) {
  //     cmdOpts.stderr = 'pipe'
  //   }
  //   if (cmdOpts.limitSamples === undefined) {
  //     cmdOpts.limitSamples = 3
  //   }
  //
  //   let dir = this.dir || this.runtime.init.cliargs.projectDir
  //
  //   const opts = {
  //     cwd  : dir,
  //     env  : utils.buildChildEnv(cmdOpts.env, this.runtime.init.env),
  //     stdio: [ cmdOpts.stdin, cmdOpts.stdout, cmdOpts.stderr ],
  //     input: cmdOpts.input,
  //   }
  //
  //   let debugCmd = this._debugCmd(opts, cmdArgs)
  //   debug(debugCmd)
  //
  //   const cmd = cmdArgs.shift()
  //   const child = spawn(cmd, cmdArgs, opts)
  //   let lastStderr = []
  //   let lastStdout = []
  //
  //   if (child.stdout) {
  //     child.stdout.on('data', data => {
  //       if (data) {
  //         lastStdout.push(`${data}`)
  //         if (cmdOpts.limitSamples) {
  //           lastStdout = _.takeRight(lastStdout, cmdOpts.limitSamples)
  //         }
  //       }
  //
  //       if (cmdOpts.verbose) {
  //         return this._scroll(chalk.gray(data))
  //       }
  //     })
  //   }
  //
  //   if (child.stderr) {
  //     child.stderr.on('data', data => {
  //       if (data) {
  //         lastStderr.push(`${data}`)
  //         if (cmdOpts.limitSamples) {
  //           lastStderr = _.takeRight(lastStderr, cmdOpts.limitSamples)
  //         }
  //       }
  //
  //       if (cmdOpts.verbose) {
  //         return this._scroll(chalk.red(data))
  //       }
  //     })
  //   }
  //
  //   return child.on('close', code => {
  //     if (code !== 0) {
  //       const msg = `Script '${cmd} ${cmdArgs.join(' ')}' exited with code: '${code}'`
  //       const err = new Error(msg)
  //       let lastInfo
  //
  //       if (lastStderr.length) {
  //         lastInfo = lastStderr
  //       } else {
  //         lastInfo = lastStdout
  //       }
  //
  //       err.details = lastInfo.join('')
  //       return cb(err)
  //     }
  //
  //     return cb(null, lastStdout.join(''))
  //   })
  // }
}

module.exports = Shell
