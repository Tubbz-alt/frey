const _ = require('lodash')
const Shell = require('./Shell')
const constants = require('./constants')
const Scrolex = require('scrolex')
const utils = require('./Utils')
// const debug = require('depurar')('frey')
class App {
  constructor (opts) {
    this.opts = opts
    this.runtime = opts.runtime
    this.shell = new Shell(this.runtime)
  }

  _exe (inDefaults, cb) {
    const defaults = _.cloneDeep(inDefaults)

    const exe = this.opts.exe || defaults.exe
    const signatureOpts = this.opts.signatureOpts || defaults.signatureOpts
    const cmdOpts = this.opts.cmdOpts || defaults.cmdOpts || {}
    const env = utils.buildChildEnv(this._objectToEnv(_.defaults(this.opts.env, defaults.env)), this.runtime.init.env)
    const args = this._objectToFlags(_.defaults(this.opts.args, defaults.args), signatureOpts)

    cmdOpts.env = env

    if (!cmdOpts.components) {
      cmdOpts.addCommandAsComponent = true
      cmdOpts.mode = process.env.FREY_SCROLEX_MODE || process.env.SCROLEX_MODE || 'singlescroll'
      cmdOpts.components = `frey>${global.frey.currentHost}>${global.frey.currentCommand}`
    }

    const cmdArgs = [ exe ].concat(args)

    Scrolex.exe(cmdArgs, cmdOpts, (err, out) => {
      if (err) {
        return cb(err)
      }

      return cb(null, out)
    })
  }

  _escape (str) {
    if (!str.replace) {
      throw new Error(`You should pass _escape a string. But you passed: ${str}`)
    }
    return str.replace(/([^a-zA-Z0-9\-./,_])/g, '\\$1')
  }

  _objectToEnv (obj, opts = {}) {
    // Unset all that was turned off via null
    _.forOwn(obj, (val, key) => {
      if (val === null) {
        delete obj[key]
      }
    })

    return obj
  }

  _objectToFlags (obj, opts = {}) {
    // Unset all that was turned off via null
    _.forOwn(obj, (val, key) => {
      if (val === null) {
        delete obj[key]
      }
    })

    opts.equal = opts.equal || ''
    opts.quote = opts.quote || ''
    opts.dash = opts.dash || ''
    opts.escape = opts.escape === true || opts.escape === undefined

    let fn = str => {
      return str
    }
    if (opts.escape) {
      fn = this._escape
    }

    const args = []
    const prepend = []
    const append = []
    _.forOwn(obj, (val, key) => {
      if (val === constants.SHELLARG_BOOLEAN_FLAG) {
        // turn on a boolean flag
        args.push([ opts.dash, fn(key) ].join(''))
      } else if (val === constants.SHELLARG_PREPEND_AS_IS) {
        // add the value as is
        prepend.push(fn(key))
      } else if (val === constants.SHELLARG_APPEND_AS_IS) {
        // add the value as is
        append.push(fn(key))
      } else if (val === constants.SHELLARG_REMOVE) {
        // turned off, don't add at all
        return
      } else {
        // key/value pair
        args.push([ opts.dash, fn(key), opts.equal, opts.quote, fn(val), opts.quote ].join(''))
      }
    })

    return prepend.concat(args, append)
  }
}

module.exports = App
