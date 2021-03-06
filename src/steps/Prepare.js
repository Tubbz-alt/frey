const Step = require('../Step')
const utils = require('../Utils')
const mkdirp = require('mkdirp')

const Bash = require('../apps/Bash')
const semver = require('semver')
const fs = require('fs')
const async = require('async')
const depurar = require('depurar')
const debug = depurar('frey')

class Prepare extends Step {
  constructor (name, runtime) {
    super(name, runtime)
    this.dir = this.runtime.init.cliargs.projectDir
  }

  main (cargo, cb) {
    return async.eachSeries(this.runtime.deps, this._make.bind(this), err => {
      if (err) {
        return cb(err)
      }

      cb(null, {})
    })
  }

  _make (props, cb) {
    let func = this[`_make${props.type}`]
    if (!func) {
      return cb(new Error(`Unsupported dependency type: '${props.type}'`))
    }

    func = func.bind(this)
    return func(props, cb)
  }

  _makePrivkey ({ privkey, privkeyEnc, email }, cb) {
    return fs.stat(privkey, err => {
      if (!err) {
        // Already exists
        debug(`Key '${privkey}' aready exists`)
        return cb(null)
      }

      fs.stat(privkeyEnc, err => {
        if (!err) {
          // We have an encrypted version, let's try a reconstruct
          if (!process.env.FREY_ENCRYPTION_SECRET) {
            debug(
              `Wanted to reconstruct '${privkey}' from '${privkeyEnc}' but there is no FREY_ENCRYPTION_SECRET`
            )
          } else {
            process.on('exit', code => {
              // From node docs: "You must only perform synchronous operations in this handler"
              try {
                this._scroll(`Cleaning up '${privkey}' after process exit with code '${code}' `)
                fs.unlinkSync(privkey)
              } catch (e) {
                this._scroll(`Was unable to clean up '${privkey}'`)
              }
            })

            this._scroll(`Reconstructing private key '${privkey}' from '${privkeyEnc}'`)
            return utils.decryptFile(
              privkeyEnc,
              privkey,
              process.env.FREY_ENCRYPTION_SECRET,
              err => {
                if (err) {
                  return cb(err)
                }
                const cmd = [
                  `(grep 'BEGIN RSA PRIVATE KEY' '${privkey}' || (rm -f '${privkey}'; false))`,
                  `chmod 400 '${privkey}'`,
                ].join(' && ')
                new Bash().exe({ script: cmd, mode: 'silent' }, cb)
              }
            )
          }
        }

        this._scroll(`Creating private key '${privkey}'`)
        const cmd = [
          `ssh-keygen -b 2048 -t rsa -C '${email}' -f '${privkey}' -q -N ''`,
          `rm -f '${privkey}.pub'`,
        ].join(' && ')
        new Bash().exe({ script: cmd, mode: 'silent' }, cb)
      })
    })
  }

  _makePrivkeyEnc ({ privkeyEnc, privkey }, cb) {
    if (!process.env.FREY_ENCRYPTION_SECRET) {
      // Not needed
      debug(`Skipping creation of '${privkeyEnc}', as there is no FREY_ENCRYPTION_SECRET`)
      return cb(null)
    }
    return fs.stat(privkeyEnc, err => {
      if (!err) {
        // Already exists
        debug(`Key '${privkeyEnc}' aready exists`)
        return cb(null)
      }

      this._scroll(`Creating private encrypted key '${privkeyEnc}'`)
      utils.encryptFile(privkey, privkeyEnc, process.env.FREY_ENCRYPTION_SECRET, err => {
        if (err) {
          return cb(err)
        }

        new Bash().exe({ script: `chmod 400 '${privkeyEnc}'`, mode: 'silent' }, cb)
      })
    })
  }

  _makePubkey ({ pubkey, privkey, email }, cb) {
    return fs.stat(pubkey, err => {
      if (!err) {
        // Already exists
        debug(`Key '${pubkey}' aready exists`)
        return cb(null)
      }

      this._scroll(`Creating public key '${pubkey}'`)
      const cmd = [
        `echo -n $(ssh-keygen -yf '${privkey}') > '${pubkey}'`,
        `echo ' ${email}' >> '${pubkey}'`,
      ].join(' && ')

      new Bash().exe({ script: cmd, stdio: [process.stdin, 'pipe', 'pipe'], mode: 'silent' }, cb)
    })
  }

  _makePubkeyFingerprint ({ pubkey }, cb) {
    const cmd = `ssh-keygen -lf '${pubkey}' | awk '{print $2}'`
    new Bash().exe({ script: cmd, mode: 'silent' }, (err, stdout) => {
      this.runtime.config.global.ssh.keypub_fingerprint = `${stdout}`.trim()
      return cb(err)
    })
  }

  _makePermission ({ file, mode }, cb) {
    debug(`perming ${file} ${mode}`)
    return fs.chmod(file, mode, cb)
  }

  _makeDir ({ dir, name }, cb) {
    return mkdirp(dir, err => {
      if (err) {
        return cb(err)
      }

      debug(`Directory for '${name}' present at '${dir}'`)
      return cb(null)
    })
  }

  _makeApp (props, cb) {
    return this._satisfy(props, satisfied => {
      if (satisfied) {
        return cb(null)
      }

      return utils.confirm(`May I run '${props.cmdInstall}' for you?`, this.runtime.init.cliargs.forceYes, err => {
        if (err) {
          return cb(err)
        }

        new Bash().exe({ script: props.cmdInstall }, (err, stdout) => {
          if (err) {
            return cb(new Error(`Failed to install '${props.name}'. ${err}`))
          }

          return this._satisfy(props, satisfied => {
            if (!satisfied) {
              const msg = `Version of '${props.name}' still not satisfied after install`
              return cb(new Error(msg))
            }

            return cb(null)
          })
        })
      })
    })
  }

  _satisfy (appProps, cb) {
    new Bash().exe({ script: appProps.cmdVersion, mode: 'silent' }, (err, stdout) => {
      const foundVersion = appProps.versionTransformer(stdout)

      if (err) {
        // We don't want to bail out if version step does not exist yet
        // Or maybe --version returns non-zero exit code, which is common
        debug({
          msg: `Continuing after failed step ${appProps.cmd}. ${err}`,
          exe: appProps.exe,
          foundVersion,
          err,
          stdout,
        })
      }

      this._scroll(`Found '${appProps.name}' with version '${foundVersion}'`)

      if (!stdout || !semver.satisfies(foundVersion, appProps.range)) {
        this._scroll(`'${appProps.name}' needs to be installed or upgraded. `)
        return cb(false)
      }

      return cb(true)
    })
  }
}

module.exports = Prepare
