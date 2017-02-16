const Step = require('../Step')
const constants = require('../constants')
const Terraform = require('../apps/Terraform')
const async = require('async')
const utils = require('../Utils')
const fs = require('fs')
// const _ = require('lodash')
const globby = require('globby')
const depurar = require('depurar')

const debug = depurar('frey')

class Format extends Step {
  constructor (name, runtime) {
    super(name, runtime)
    this.boot = ['_confirm']
  }

  _confirm (cargo, cb) {
    utils.confirm(
      'About to rewrite all HCL files in your project dir. Make sure your files are under source control as this is a best-effort procedure. May I proceed?',
      this.runtime.init.cliargs.forceYes,
      cb
    )
  }

  _reformatFile (hclFile, cb) {
    let args = {
      fmt        : constants.SHELLARG_PREPEND_AS_IS,
      list       : true,
      state      : constants.SHELLARG_REMOVE,
      parallelism: constants.SHELLARG_REMOVE,
    }
    args[hclFile] = constants.SHELLARG_APPEND_AS_IS

    new Terraform().exe({ mode: 'silent', args, runtime: this.runtime }, err => {
      if (err) {
        return cb(err)
      }

      let buf = fs.readFileSync(hclFile, 'utf-8')

      // remove equal sign from ` = {`
      buf = buf.replace(/ = {$/gm, ' {')

      // unquote keys if possible
      buf = buf.replace(/^(.*)"([a-z_]+)"(.*){$/gm, '$1$2$3{')
      buf = buf.replace(/^(\s+)"([a-z_]+)"(\s+)=/gm, '$1$2$3=')

      // remove all empty newlines
      buf = buf.replace(/\n(\n+)/gm, '\n')

      // add back newlines, just after main closing blocks
      buf = buf.replace(/^}$/gm, '}\n')

      fs.writeFileSync(hclFile, buf, 'utf-8')

      debug(`Saved ${hclFile}`)
      utils.confirm(
        'About to rewrite all HCL files in your project dir. Make sure your files are under source control as this is a best-effort procedure. May I proceed?',
        this.runtime.init.cliargs.forceYes,
        cb
      )
    })
  }

  main (cargo, cb) {
    const pattern = `${this.runtime.init.cliargs.projectDir}/*.hcl`
    debug(`Reading from '${pattern}'`)
    return globby(pattern)
      .then(tomlFiles => {
        async.map(tomlFiles, this._reformatFile.bind(this), (err, results) => {
          if (err) {
            return cb(err)
          }
          return cb(null)
        })
      })
      .catch(cb)
  }
}

module.exports = Format
