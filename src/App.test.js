const App = require('./App')
const expect = require('chai').expect
// const debug = require('depurar')('frey')
// debug utils
describe('App', () => {
  describe('_buildChildEnv', () => {
    it('should convert tf vars', done => {
      const app = new App()
      const env = app._buildChildEnv({ EXTRA: 'Yes Please' }, { FREY_SOMETHING: 'foobar' })
      expect(env).to.deep.equal({
        EXTRA                : 'Yes Please',
        FREY_SOMETHING       : 'foobar',
        TF_VAR_FREY_SOMETHING: 'foobar',
      })
      done()
    })
  })
})
