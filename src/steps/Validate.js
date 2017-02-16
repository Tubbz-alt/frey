const Step = require('../Step')
// const debug = require('depurar')('frey')
class Validate extends Step {
  main (cargo, cb) {
    if (!this.runtime.init.paths.git_dir) {
      const msg = 'Frey requires project (and state) to be under Git, and residu to be ignored.'
      return cb(new Error(msg))
    }

    return cb(null)
  }
}

module.exports = Validate
