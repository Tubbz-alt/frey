const chalk = require('chalk')
const util = require('util')
const async = require('async')
const _ = require('lodash')
const depurar = require('depurar')
const debug = depurar('frey')
const scrolex = require('scrolex')

class Base {
  constructor () {
    this.boot = []
    this.bootCargo = {}
  }

  main (bootOptions, cb) {
    debug('You should override this with main class logic. ')
    return cb(null)
  }

  /**
   * Runs a methods found in this.boot similar to async.waterfall,
   * but stores each result in this.bootCargo[method] so it's accessible
   * not just by the next method, but methods after that too.
   *
   * After all the methods in this.boot are called, it finally coveralls
   * this.main
   *
   * @param {cb} function when done
   */
  run (cb) {
    // Create an array of wrapper methods that can store results
    // in bootCargo, before executing the callback
    const methods = []
    this.boot.forEach(method => {
      return methods.push((cargo, cb) => {
        const f = this[method].bind(this)
        return f(cargo, (err, cargo) => {
          this.bootCargo[method] = cargo
          return cb(err, cargo)
        })
      })
    })

    // Prefix a fake method so all methods can have the same signature
    methods.unshift(async.constant({}))

    // Run the wrappers
    return async.waterfall(methods, (err, bootOptions) => {
      if (err) {
        return cb(err)
      }

      this.main(bootOptions, cb)
    })
  }

  _secureOutput (input) {
    let result = _.clone(input)

    if (_.isObject(result)) {
      _.forOwn(result, (val, key) => {
        result[key] = this._secureOutput(val)
      })
    } else if (_.isArray(result)) {
      result.forEach((val, i) => {
        result[i] = this._secureOutput(val)
      })
    } else if (_.isString(result)) {
      _.forOwn(process.env, (val, key) => {
        if (
          key.indexOf('SECRET') > -1 || key.indexOf('PASSWORD') > -1 || key.indexOf('TOKEN') > -1
        ) {
          result = _.replace(result, val, '********')
        }
      })
    }

    return result
  }

  _formatter (args) {
    let index = 0
    let str = args[0]
    str = `${str}`.replace(/%[o%s]/g, m => {
      if (m === '%%') {
        return m
      }

      index++
      let ret = _.pullAt(args, index)[0]
      ret = util.inspect(ret, { colors: chalk.supportsColor })

      if (m === '%o') {
        ret = ret.replace(/\s*\n\s*/g, ' ')
      }

      return ret
    })

    str = this._secureOutput(str)
    return str
  }

  _scroll (...args) {
    const str = this._formatter(args)
    scrolex.scroll(`${str}`)
  }

  _stick (...args) {
    const str = this._formatter(args)
    scrolex.stick(`${str}`)
  }

  _failure (...args) {
    const str = this._formatter(args)
    scrolex.failure(`${str}`)
  }

  _success (...args) {
    const str = this._formatter(args)
    scrolex.success(`${str}`)
  }
}

module.exports = Base
