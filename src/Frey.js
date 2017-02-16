// var info = Depurar('frey')
// const util = require('util')
// const fs = require('fs')
// const debug = require('depurar')('frey')
const inflection = require('inflection')
const async = require('async')
const _ = require('lodash')
// const chalk = require('chalk')
const Base = require('./Base')
const steps = require('./steps')
const pkgConfig = require('../package.json')

const scrolex = require('scrolex').persistOpts({
  addCommandAsComponent: false,
  announce             : false,
  components           : `frey>main`,
  mode                 : process.env.FREY_SCROLEX_MODE || process.env.SCROLEX_MODE || 'singlescroll',
})

class Frey extends Base {
  constructor (cliargs = {}) {
    super()

    if (cliargs._ === undefined) {
      cliargs._ = []
    }
    if (cliargs._[0] === undefined) {
      cliargs._[0] = 'prepare'
    }

    this.boot = ['_injectCliargs', '_composeChain']
    this.runtime = { frey: { cliargs } }
  }

  _injectCliargs (cargo, nextCb) {
    nextCb(null, _.clone(this.runtime.frey.cliargs))
  }

  _composeChain (cliargs, nextCb) {
    const cmd = cliargs._[0]
    const chain = _.filter(steps, { chained: true })
    const startAt = _.findIndex(chain, { name: cmd })
    let filteredChain = []

    if (startAt < 0) {
      // This step is not part of the chain
      filteredChain = [cmd]
    } else {
      let length = 0
      if (cliargs.bail) {
        length = startAt + 1
      } else if (cliargs.bailAfter && _.findIndex(chain, { name: cliargs.bailAfter }) > -1) {
        length = _.findIndex(chain, { name: cliargs.bailAfter }) + 1
      } else {
        length = chain.length
      }

      const sliced = chain.slice(startAt, length)
      filteredChain = _.map(sliced, 'name')
    }

    // Always plan infra
    if (filteredChain.indexOf('plan') < 0 && filteredChain.indexOf('infra') > -1) {
      filteredChain.unshift('plan')
    }
    // Always get modules
    if (filteredChain.indexOf('get') < 0 && filteredChain.indexOf('infra') > -1) {
      filteredChain.unshift('get')
    }

    if (
      filteredChain.indexOf('prepare') < 0 &&
      (startAt < 0 || startAt > _.findIndex(chain, { name: 'prepare' }))
    ) {
      if (cmd !== 'convert') {
        filteredChain.unshift('prepare')
      }
    }

    if (
      filteredChain.indexOf('format') < 0 &&
      (startAt < 0 || startAt > _.findIndex(chain, { name: 'format' }))
    ) {
      if (cmd === 'convert' && !cliargs.bail) {
        filteredChain.push('format')
      }
    }

    if (
      filteredChain.indexOf('deps') < 0 &&
      (startAt < 0 || startAt > _.findIndex(chain, { name: 'deps' }))
    ) {
      filteredChain.unshift('deps')
    }

    if (
      filteredChain.indexOf('config') < 0 &&
      (startAt < 0 || startAt > _.findIndex(chain, { name: 'config' }))
    ) {
      filteredChain.unshift('config')
    }

    filteredChain.unshift('init')

    nextCb(null, filteredChain)
  }

  main (cargo, cb) {
    this._stick('Frey version %s', pkgConfig.version)
    this._stick('Will run: %o', this.bootCargo._composeChain)

    async.eachSeries(this.bootCargo._composeChain, this._runOne.bind(this), cb)
  }

  _runOne (step, cb) {
    const className = inflection.camelize(step, false)
    const p = `./steps/${className}`
    const Class = require(p)
    const obj = new Class(step, this.runtime)
    const func = obj.run.bind(obj)

    scrolex.persistOpts({
      components: `frey>${step}`,
    })

    func((err, result) => {
      const append = {}
      append[step] = result
      this.runtime = _.extend(this.runtime, append)
      return cb(err)
    })
  }
}

module.exports = Frey
