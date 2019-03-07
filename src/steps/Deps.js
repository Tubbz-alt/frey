const Step = require('../Step')
const utils = require('../Utils')

// const debug = require('depurar')('frey')
class Deps extends Step {
  main (cargo, cb) {
    let deps = []

    deps.push({ type: 'Dir', name: 'process_tmp_dir', dir: '{{{init.paths.process_tmp_dir}}}' })

    deps.push({ type: 'Dir', name: 'tools_dir', dir: '{{{config.global.tools_dir}}}' })

    deps.push({ type: 'Dir', name: 'projectDir', dir: '{{{init.cliargs.projectDir}}}' })

    deps.push({ type: 'Dir', name: 'global.ssh.key_dir', dir: '{{{config.global.ssh.key_dir}}}' })

    deps.push({
      type      : 'Privkey',
      privkey   : '{{{config.global.ssh.privatekey_file}}}',
      pubkey    : '{{{config.global.ssh.publickey_file}}}',
      privkeyEnc: '{{{config.global.ssh.privatekey_enc_file}}}',
      email     : '{{{config.global.ssh.email}}}',
    })

    deps.push({
      type   : 'Pubkey',
      privkey: '{{{config.global.ssh.privatekey_file}}}',
      pubkey : '{{{config.global.ssh.publickey_file}}}',
      email  : '{{{config.global.ssh.email}}}',
    })

    deps.push({
      type      : 'PrivkeyEnc',
      privkey   : '{{{config.global.ssh.privatekey_file}}}',
      privkeyEnc: '{{{config.global.ssh.privatekey_enc_file}}}',
    })

    deps.push({ type: 'Permission', mode: 0o400, file: '{{{config.global.ssh.publickey_file}}}' })

    deps.push({ type: 'Permission', mode: 0o400, file: '{{{config.global.ssh.privatekey_file}}}' })

    deps.push({
      type   : 'App',
      name   : 'terraform',
      version: '0.9.6',
      range  : '{{{self.version}}}',
      dir    : '{{{config.global.tools_dir}}}/terraform/{{{self.version}}}',
      exe    : '{{{self.dir}}}/terraform',
      zip    : (
        'terraform_' + '{{{self.version}}}_' + '{{{init.os.platform}}}_' + '{{{init.os.arch}}}.zip'
      ),
      cmdVersion: '{{{self.exe}}} --version',
      versionTransformer (stdout) {
        const version = `${stdout}`.trim().split('\n')[0].split(/\s+/).pop().replace('v', '')
        return version
      },
      cmdInstall: (
        'mkdir -p {{{self.dir}}} && ' +
          'cd {{{self.dir}}} && ' +
          "curl -sSL '" +
          'https://releases.hashicorp.com/terraform/{{{self.version}}}/' +
          "{{{self.zip}}}'" +
          "> '{{{self.zip}}}' && " +
          "unzip -o '{{{self.zip}}}'"
      ),
    })

    deps.push({
      type   : 'App',
      name   : 'terraformInventory',
      range  : '0.6.0',
      version: '0.6',
      dir    : '{{{config.global.tools_dir}}}/terraform-inventory/{{{self.version}}}',
      exe    : '{{{self.dir}}}/terraform-inventory',
      zip    : (
        'terraform-inventory_' +
          '{{{self.version}}}_' +
          '{{{init.os.platform}}}_' +
          '{{{init.os.arch}}}.zip'
      ),
      cmdVersion: '{{{self.exe}}} --version',
      versionTransformer (stdout) {
        let version = `${stdout}`.trim().split('\n')[0].split(/\s+/).pop().replace('v', '')
        version = version.replace(/^(\d+\.\d+)/, '$1.0')
        return version
      },
      cmdInstall: (
        'mkdir -p {{{self.dir}}} && ' +
          'cd {{{self.dir}}} && ' +
          "curl -sSL '" +
          'https://github.com/adammck/terraform-inventory/releases/download/' +
          'v{{{self.version}}}/' +
          "{{{self.zip}}}'" +
          "> '{{{self.zip}}}' && " +
          "unzip -o '{{{self.zip}}}'"
      ),
    })

    deps.push({
      type      : 'App',
      name      : 'pip',
      exe       : 'pip',
      version   : '9.0.1',
      range     : '>= {{{self.version}}}',
      cmdVersion: '{{{self.exe}}} --version',
      versionTransformer (stdout) {
        if (!stdout) {
          return stdout
        }
        const parts = `${stdout}`.trim().split('\n')[0].split(/\s+/)
        if (!parts || !parts[1]) {
          return stdout
        }
        const version = `${parts[1]}`.replace('v', '')

        let pp = version.split('.')
        if (pp.length === 2) {
          version += '.0'
        }

        return version
      },
      cmdInstall: (
        `sudo -HE env PATH=\${PATH:-} LD_LIBRARY_PATH=\${LD_LIBRARY_PATH:-} PYTHONPATH=\${PYTHONPATH:-} easy_install --upgrade pip==9.0.1 && $(which pip) && pip --version`
      ),
    })

    deps.push({
      type       : 'App',
      name       : 'ansible',
      range      : '>= 2.1.4',
      version    : '2.1.4',
      dir        : '{{{config.global.tools_dir}}}/ansible/{{{self.version}}}',
      exe        : '{{{self.dir}}}/pip/bin/ansible',
      exePlaybook: '{{{self.dir}}}/pip/bin/ansible-playbook',
      env        : { PYTHONPATH: '{{{parent.dir}}}/pip/lib/python2.7/site-packages' },
      cmdPlaybook: 'env PYTHONPATH={{{self.dir}}}/pip/lib/python2.7/site-packages {{{self.exePlaybook}}} ',
      cmdVersion : 'env PYTHONPATH={{{self.dir}}}/pip/lib/python2.7/site-packages {{{self.exePlaybook}}} --version',
      versionTransformer (stdout) {
        let version = `${stdout}`.trim().split('\n')[0].split(/\s+/).pop().replace('v', '')
        let parts = version.split('.').slice(0, 3)
        version = parts.join('.')
        return version
      },
      cmdInstall: (
        'mkdir -p {{{self.dir}}} && ' +
          'pip install ' +
          '--prefix=pip ' +
          '--ignore-installed ' +
          '--force-reinstall ' +
          "--root '{{{self.dir}}}' " +
          '--upgrade ' +
          '--disable-pip-version-check ' +
          'ansible=={{{self.version}}}'
      ),
    })

    deps = utils.render(deps, this.runtime)

    cb(null, deps)
  }
}

module.exports = Deps
