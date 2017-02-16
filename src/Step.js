const Base = require('./Base')

class Step extends Base {
  constructor (name, runtime) {
    super()
    this.name = name
    this.runtime = runtime
  }
}

module.exports = Step
