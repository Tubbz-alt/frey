const _ = require('lodash')
const constants = require('./constants')
const debug = require('depurar')('frey')
const scrolex = require('scrolex')

class App {
  _debugCmd ({ cmdOpts, env }, args) {
    const input = cmdOpts && cmdOpts.stdio ? cmdOpts.stdio[0] : false

    let debugCmd = ''
    if (input && input !== 'inherit' && input !== 0 && input !== process.stdin) {
      debugCmd += `echo '${input}' | \\\n`
    }

    _.forOwn(env, (val, key) => {
      if (_.has(process.env, key)) {
        return
      }
      if (key.indexOf('npm_config') === 0) {
        return
      }
      if (key.indexOf('MFLAGS') === 0) {
        return
      }
      if (key.indexOf('MAKEFLAGS') === 0) {
        return
      }
      if (key.indexOf('TF_VAR_') === 0) {
        return
      }
      if (key.indexOf('FREY_') === 0) {
        return
      }
      debugCmd += `${key}=${val} \\\n`
    })
    debugCmd += `${args.join(' \\\n  ')} \\\n|| false`

    debugCmd = debugCmd.replace(/-o \\\n {2}/g, '-o ')
    return debugCmd
  }

  _buildChildEnv (extra = {}, processEnv = {}) {
    let childEnv = {}

    childEnv = _.extend({}, processEnv, extra)

    // Automatically add all FREY_* environment variables to Terraform environment
    _.forOwn(processEnv, (val, key) => {
      if (_.startsWith(key, 'FREY_')) {
        childEnv[`TF_VAR_${key}`] = val
      }
    })

    return childEnv
  }

  _appDefaults (userOpts, runtime, cb) {
    throw new Error(`_appDefaults should be overridden`)
  }

  exe (userOpts, cb) {
    const runtime = userOpts.runtime
    this._appDefaults(userOpts, runtime, (err, appDefaults) => {
      if (err) {
        return cb(err)
      }

      const opts = _.defaultsDeep({}, userOpts, _.cloneDeep(appDefaults))
      const runtimeEnv = runtime && runtime.init ? runtime.init.env : {}
      const env = this._buildChildEnv(this._objectToEnv(opts.env || {}), runtimeEnv)
      const args = this._objectToFlags(opts.args, opts.signatureOpts)

      const scrolexOpts = {
        stdio: opts.stdio || ['pipe', 'pipe', 'pipe'],
      }

      if (_.keys(env).length > 0) {
        // Only add env if it's filled, otherwise we boot processes with an empty env, leading to $PATH finding issues
        scrolexOpts.env = env
      }

      if ('mode' in opts) {
        scrolexOpts.mode = opts.mode
      }
      if ('addCommandAsComponent' in opts) {
        scrolexOpts.addCommandAsComponent = opts.addCommandAsComponent
      }
      if ('cbPreLinefeed' in opts) {
        scrolexOpts.cbPreLinefeed = opts.cbPreLinefeed
      }
      if ('showCmd' in opts) {
        scrolexOpts.showCmd = opts.showCmd
      }
      if ('cwd' in opts) {
        scrolexOpts.cwd = opts.cwd
      }

      const scrolexArgs = [opts.exe].concat(args)

      // const debugCmd = this._debugCmd({ scrolexOpts, env }, scrolexArgs)
      // debug({debugCmd})

      scrolex.exe(scrolexArgs, scrolexOpts, (err, out) => {
        if (err) {
          return cb(err)
        }

        return cb(null, out)
      })
    })
  }

  _escape (str) {
    if (str === true || str === false) {
      return str
    }
    if (`${str}` !== str) {
      debug({ str })
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
        args.push([opts.dash, fn(key)].join(''))
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
        // (array of) key/value pairs
        const vals = _.isArray(val) ? val : [val]
        vals.forEach(val => {
          args.push(`${opts.dash}${fn(key)}${opts.equal}${opts.quote}${fn(val)}${opts.quote}`)
        })
      }
    })

    return prepend.concat(args, append)
  }
}

module.exports = App
