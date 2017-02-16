const Base = require('./Base')
const Shell = require('./Shell')

class Step extends Base {
  constructor (name, runtime) {
    super()
    this.name = name
    this.runtime = runtime
    this.shell = new Shell(runtime)
  }
}

module.exports = Step
