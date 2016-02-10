'use strict'
import depurar from 'depurar'; const debug = depurar('frey')
import _ from 'lodash'
import flatten from 'flat'

class Utils {
  render (subject, data, opts = {}) {
    if (opts.failhard === undefined) { opts.failhard = true }

    const flattened = flatten(data, {delimiter: '__'})

    if (_.isArray(subject)) {
      subject.forEach((val, key) => {
        subject[key] = this.render(val, flattened, opts)
      })
      return subject
    }

    if (_.isObject(subject)) {
      // It's possible we're doing recursive resolving here, for instance when
      // render(options, options) is used. So in this case, we keep rendering, until
      // the string is no longer changing
      let change = true
      while (change) {
        change = false
        _.forOwn(subject, (val, key) => {
          let tmp = this.render(val, flattened, { failhard: false })
          if (tmp !== subject[key]) {
            subject[key] = tmp
            change = true
          }
        })
      }
      _.forOwn(subject, (val, key) => {
        if (`${val}`.indexOf('{{{') > -1) {
          debug(flattened)
          throw new Error(`Unable to render vars in '${val}'. `)
        }
      })
      return subject
    }

    if (!_.isString(subject)) {
      return subject
    }

    // Use custom template delimiters.
    _.templateSettings.interpolate = /{{{([^}]+)}}}/g
    var compiled = _.template(subject)
    try {
      subject = compiled(flattened)
    } catch (e) {
      if (opts.failhard === true) {
        debug(flattened)
        throw new Error(`Unable to render vars in '${subject}'. ${e}`)
      }
    }

    return subject
  }
}

module.exports = new Utils()