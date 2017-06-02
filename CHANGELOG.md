# Changelog

## Ideabox

Unreleased and unplanned todos

- [ ] Consider detecting the User's config dir, and storing tools there, vs having a `~/.frey`
- [ ] Consider only source `*.frey.hcl` files, or using imports, so that random `*.hcl` isn't merged in.
- [ ] Ditch yargs for mimimist, now that we can have autocomplete via liftoff already
- [ ] Empty out and remove `Base` class?
- [ ] Figure out local Pip installs so we can build on Travis `sudo: false` platform
- [ ] Implement `commit`: Safely commit state automatically
- [ ] Indent stdout/err
- [ ] Mocha tests for `App`
- [ ] Mocha tests for `Base`
- [ ] Remote state in S3 feature
- [ ] Use Terraform modules similar to Ansible roles: https://www.terraform.io/docs/modules/sources.html
- [ ] Vagrant support
- [ ] website: Console window like http://lebab.io/? Here's another: http://codepen.io/peiche/details/LNVYzJ/
- [ ] website: pitch: "don't hide away infra in obscure documentation, repos, datacenters, support desks. Evolve it together with your app"
- [ ] docs: since node is installed on Every Travis image, you can easily deploy go projects with frey http://stackoverflow.com/questions/31235146/how-to-run-node-js-and-ruby-tests-within-one-project-on-travis-ci
- [ ] docs: env secrets on Travis are not exposed to PRs from other repos: https://docs.travis-ci.com/user/pull-requests
- [ ] Add generic cleanup method that `.pem` as well as `Frey-residu-*` can be registered with, so it will all be deleted if `global.purge_residu` is turned on (default = `true`)
- [ ] Don't rely on `exceptions` in `squashArrays`, but have a more clever system to preserve arrays (a better json2hcl or adhering to arrayed config might also fix this already, ridding ourselves from squash)

## v0.3.x

Released: Unreleased.

- [ ] Consider putting `provider` `output` `variable` `resource` at the root level, and removing intermediate `playbooks` level from `install`, `setup`, `backup`, `restore`, etc. This will simplify how the hcl looks, and (maybe) allow us to keep the hcl for terraform untouched, vs doing hcl->object->json (but what about injecting FREY vars..)
- [ ] Make Frey less 'classy', utilizing more pure functions, and allow the introduction of globals such as `runtime`
- [ ] allow Ansible and Terraform version override from config
- [ ] Check for `git ignore Frey-residu-*`
- [ ] Don't set default arguments for Apps so we can deprecate `SHELLARG_REMOVE`
- [ ] Offer cast5 encryption and decryption for `env.sh` (then remove `rebuild-env.sh` script from dependents)
- [ ] `Show` should use `terraformInventory` just like `Remote`, instead of `public_addresses`
- [ ] Speed up prepare by writing hashses do disk and comparing (just like depmake does)
- [ ] Symlink ansible if needed: `mkdir -p ~/.frey/tools/ansible/2.0.1.0/pip/bin/ && ln -nfs ~/.frey/tools/ansible/2.0.1.0/usr/local/share/python/ansible ~/.frey/tools/ansible/2.0.1.0/pip/bin/ansible && ln -nfs ~/.frey/tools/ansible/2.0.1.0/usr/local/share/python/ansible-playbook ~/.frey/tools/ansible/2.0.1.0/pip/bin/ansible-playbook`
- [ ] Deal with pip returning version `1.1` in some cases (we error out on that currently with an unrecognized version)
- [ ] Switch from terraformInventory to terraform-provisioner-ansible (https://github.com/jonmorehouse/terraform-provisioner-ansible)

## master

Released: TBA.
[Diff](https://github.com/freyproject/frey/compare/v0.3.31...master).

- [ ] Transpile `facts {` to an `provisioner "remote-exec"` block writing ini file into `/etc/ansible/facts.d/frey.fact`
- [ ] When `backup` is ran by hand, the chain should not be triggered. Yet when running a chain, `backup` should be part of it
- [ ] Add support for a `alienInventory` executable, that can cough up hostnames of existing infra
- [ ] When launching `frey` and we have no `FREY_` env keys, and we do `globSync` of `env*.sh` in the `cwd()` or `projectDir`, offer a list of which one to source automatically. Then inject these into the process.env(?)
- [ ] Frey should show debug output based on `-v` or `-vv` or `-vvv`. Because it's a tool, and not a library, we should ditch the `DEBUG` env var
- [ ] Upon `may i destroy infra?` question, Frey should show all the resource IDs that are getting destroyed
- [ ] Possible bug: We should likely not squashArray ansible actions such as `restart`, or actions in multiple files in the same dir are merged into one
- [ ] Offer to run `backup` if a destructive change was detected. Skip otherwise. Defaults to yes
- [ ] Ansible command output parsing is very basic, we can do a better job
- [ ] Fix bug where Frey won't show the error output when e.g. ansible cannot connect due to an invalid pem key (likely a scrolex issue)

## v0.3.36

Released: 2017-06-02.
[Diff](https://github.com/freyproject/frey/compare/v0.3.35...v0.3.36.

- [x] Consistent casing of cli args

## v0.3.35

Released: 2017-06-02.
[Diff](https://github.com/freyproject/frey/compare/v0.3.34...v0.3.35.

- [x] Add support for Terraform's `target` to isolate resources or modules
- [x] Add support for remote state

## v0.3.34

Released: 2017-06-01.
[Diff](https://github.com/freyproject/frey/compare/v0.3.33...v0.3.34.

- [x] Change TF deprecated `key_file` to `private_key` (which requires `${file("/path")}`)
- [x] `get` is now daisychained before `refresh`, not `plan`
- [x] Fix bug where `frey get` ignores `--project-dir ./infra` and will just try to find `Terraform configuration files` in the cwd

## v0.3.33

Released: 2017-06-01.
[Diff](https://github.com/freyproject/frey/compare/v0.3.32...v0.3.33.

- [x] Fix bug complaining about `this.info`

## v0.3.32

Released: 2017-06-01.
[Diff](https://github.com/freyproject/frey/compare/v0.3.31...v0.3.32.

- [x] Upgrade from Terraform 0.7.3 -> 0.9.6
- [x] Upgrade `scrolex@0.0.27`
- [x] Update apt role ([see](https://github.com/freyproject/role-apt/compare/frey-v1.4.0...frey-v1.4.1))

## v0.3.31

Released: 2017-02-16.
[Diff](https://github.com/freyproject/frey/compare/v0.3.30...v0.3.31).

- [x] Upgrade to `scrolex@0.0.26` which will default to `passthru` `mode` on Travis CI and non-TTY environments
- [x] Remove node defaults
- [x] Improve upgrade dependents script

## v0.3.30

Released: 2017-02-16.
[Diff](https://github.com/freyproject/frey/compare/v0.3.29...v0.3.30).

- [x] Fix casing typo bug that only exposed on Linux

## v0.3.29

Released: 2017-02-16.
[Diff](https://github.com/freyproject/frey/compare/v0.3.28...v0.3.29).

- [x] Deprecate `Shell.js`
- [x] Add basic Ansible commnad output parsing -> feedback to scrolex (#62)
- [x] Simplify `App` so that there's less indirection
- [x] Add bash script linting via `shellcheck`
- [x] Replace use of ES6 `import` to `require` so we can run Frey `src` on recent nodes without babel
- [x] Make it possible to set Frey specific "role" variables (#62)
- [x] Remove `docbuild`
- [x] Rename commands->steps to reduce ambiguity
- [x] Refactor Apps, remove cmdOpts sublayer
- [x] Add support for scrolling output via scrolex
- [x] Avoid duplication in build steps
- [x] Update znq role ([see](https://github.com/triplepoint/ansible-znc/issues/4))
- [x] Add timezone role
- [x] Replace nodejs role with Oefenweb's
- [x] Add yarn role

## v0.3.28

Released: 2017-01-31.
[Diff](https://github.com/freyproject/frey/compare/v0.3.27...v0.3.28).

- [x] Upgrade all roles with upstream patches and new insights such as host vars (@tersmitten)
- [x] Fix bug where `frey remote` would not abe able to find google cloud infra

## v0.3.27

Released: 2016-12-12.
[Diff](https://github.com/freyproject/frey/compare/v0.3.26...v0.3.27).

- [x] Use --prefix=pip as per #51 (thx @ifedapoolarewaju)
- [x] Move website to own repo over at https://github.com/freyproject/website/
- [x] Move roles to own repos over at https://github.com/freyproject/ (@tersmitten)
- [x] Upgrade pip to 9.0.1 and pin version #51
- [x] Install `yarn` globally by default for the node role

## v0.3.26

Released: 2016-11-09.

- [x] Upgrade Ansible v2.0.2.0 -> v2.1.3 (@tersmitten)
- [x] Upgrade role: rsyslog v3.0.1 -> v3.0.2 (@tersmitten)

## v0.3.25

Released: 2016-09-21.

- [x] Make `remote` less noisy
- [-] Transpile terraform files one-on-one, so we can also use Frey capable modules(?) <-- No. Modules are possible but remain `tf` files. Reason: there's no sane way to spread ansible playbooks accross those.
- [x] Before `plan`, do a `terraform get`
- [x] Reformat scenario example Freyfiles 

## v0.3.24

Released: 2016-09-18.

- [x] Add nix role

## v0.3.23

Released: 2016-09-15.

- [x] Ship `bin` inside the npm as well

## v0.3.22

Released: 2016-09-15.

- [x] Upgrade from Terraform 0.6.15 -> 0.9.6 again, because all our states cannot be downgraded
- [x] Better exception handling
- [x] More control over squashArray exceptions by using full paths

## v0.3.21

Released: 2016-09-15.

- [x] Fix node install problem on Trusty with python 2.7.6: https://github.com/ansible/ansible/issues/9966#issuecomment-246373269 https://github.com/nodesource/distributions/issues/354
- [x] Squash exceptions on non object arrays
- [x] Downgrade from Terraform 0.9.6 -> 0.6.15 as the first throws EOL errors (test with `statuspage` repo and you'll see)
- [x] Less verbosity in debug mode

## v0.3.20

Released: 2016-09-14.

- [x] Write a higher quality json->hcl->json converter
- [x] Upgrade from Terraform 0.6.15 -> 0.9.6
- [-] Equal sign vertical alignment for `frey format`
- [x] Make HCL the primary format of Freyfiles (vs TOML)
- [x] Deprecate pyhcl alltogether in favor of json2hcl
- [x] Upgrade babel
- [x] Upgrade eslint and fix newly found linting issues

## v0.3.19

Released: 2016-09-02.

- [x] Upgrade depurar
- [x] Change website to use Jekyll (vs middleman)
- [x] Upgrade to Ansible 2.0.2.0 as that fixes an issue with getting remote tempdir https://github.com/ansible/ansible/issues/13876

## v0.3.18

Released: 2016-04-16.

- [x] Do a prepare before remote, so that we can have key decryption, as well as offer newcomers into a project a working `remote` (bugfixed)

## v0.3.17

Released: 2016-04-16.

- [x] Upgrade to Terraform 0.6.15
- [x] Make it easier to use Frey without Providers (just the install and setup phase, targeting hostnames you already know)
- [x] Upgrade pyhcl to 0.2.1 (see https://github.com/virtuald/pyhcl/issues/7)

## v0.3.16

Released: 2016-04-13.

- [x] Fix Remote ssh bug using `SHELLARG_PREPEND_AS_IS`
- [x] Allow more control over cli args via constants
- [x] Add support for feeding steps to `Remote` via cli

## v0.3.15

Released: 2016-03-31.

- [x] Add role: Jenkins
- [x] Collect all licenses and store them in a good/public place
- [x] Change `convert.sh` to `frey convert` making the dependencies installed by `prepare`
- [x] Fix bug where projectDir cli argument was not respected if you did not have a Freyfile in it (useful for `convert`)
- [x] Add role: munin-node
- [x] Step's exe functions should mostly be in a util class

## v0.3.14

Released: 2016-03-30.

- [x] Fix for incomplete Node 0.10 version matching

## v0.3.13

Released: 2016-03-30.

- [x] Convert `format.js` to ES6 and make it a first class citizen via `frey format`
- [x] Implement Backup and Restore via Ansible
- [x] Upgrade to Ansible 2.0.1.0 as that fixes an issue with sync asking for sudo password https://github.com/ansible/ansible-modules-core/issues/2156
- [x] Remove invalid underscore prefix from a few public `Shell` methods
- [x] Frey no longer prepares when for `remote` to speed up cli operations
- [x] Make interactive host selection a list, vs checkbox; removing 'all'
- [x] Remote now takes hosts from `terraformInventory`, not `public_addresses`
- [-] rsyslogd-2307: warning: ~ action is deprecated, consider using the 'stop' statement instead
- [x] Enable terraform debug output when `--verbose` is turned on
- [x] Make `env.sh` in upstart script optional (our `touch` it)
- [-] Consider running `frey prepare` upon `postinstall`, and then removing it from the chain (at least the installing of dependencies)
- [x] Fix bug: `Error: only one instance of babel-polyfill is allowed`

## v0.3.12

Released: 2016-03-29.

- [x] Support for node 0.10 (so Frey is usable on non-Node Travis projects - all Travis boxes ship with node 0.10)
- [x] Set ansistrano defaults: `ansistrano_current_dir: "current"` and `ansistrano_shared_paths: [ logs ]`
- [x] Allow to omit `ansistrano_npm`, `ansistrano_owner`, and `ansistrano_group`

## v0.3.11

Released: 2016-03-29.

- [x] Add run-one to cronjobs
- [x] Upgrade to Terraform 0.6.14
- [x] Cleaner debug output for `Shell`
- [x] Make smokeping more pleasant (configurable targets, no apache dependency, add TLS_DEFAULT_GATEWAY)
- [x] Add role: smokeping
- [x] Add role: prometheus
- [x] Add role: nginx
- [x] Add role: fqdn
- [x] ansistrano: Add npm installer
- [x] Add role: fqdn
- [x] Add role: rsyslog
- [x] ansistrano: Do not use sudo in rsync
- [x] ansistrano: Ensure `ansistrano_shared_rsync_copy_path` exists
- [x] ansistrano: Don't assume the shared dir is named `shared` as it's configrable
- [x] ansistrano: Ensure shared paths sources are present
- [x] Ridiculous Ansible verbosity for `--verbose`
- [x] All templates now start with `{{ ansible_managed }}`
- [x] Show copy-pastable steps in Shell's debug log
- [x] Add role: upstart
- [x] Add role: logrotate

## v0.3.10

Released: 2016-03-22.

- [x] docs: link to tusd and uppy-server
- [x] Upgrade role: deploy to 1.4.0
- [x] Add role: munin
- [x] Deprecate glob in favor of globby (which we already required in some places)

## v0.3.9

Released: 2016-03-19.

- [x] Appname can be configured in Freyfile, defaults to git dir. Git dir is in init.paths
- [x] Show endpoint if such output is available

## v0.3.8

Released: 2016-03-18.

- [x] Add role: redis
- [x] Add role: unattended-upgrades
- [x] Upgrade dependencies

## v0.3.7

Released: 2016-03-17.

- [x] Ship roles with npm

## v0.3.6

Released: 2016-03-17.

- [x] Use pyhcl 0.1.15 and 0.2.0 to avoid install crashed

## v0.3.5

Released: 2016-03-17.

- [x] Add role: nodejs
- [x] Add roles: deploy & rollback via anistrano https://github.com/ansistrano/deploy/blob/master/README.md

## v0.3.4

Released: 2016-03-16.

- [-] Write ansible instructions to a single file again, use tags to filter out at runtime
- [-] No need for underscored `_gatherTerraformArgs` functions in most Commands
- [x] docs: Chain Generator
- [x] docs: Config Generator (config defaults written to a YAML, merged with descriptions already there)
- [x] Allow `Remote` to connect to all SSH targets
- [x] Add Digital Ocean support with scenario to showcase different roles: db/www
- [x] Use extraction of `cast5` files as keys for testing by default
- [x] Error handling for missing infra_state_file
- [x] Ask confirmation when infra changes are destructive in nature
- [x] Make `Plan` mandatory to `Infra` so we can safely add `confirm`s based on changes
- [x] Replace promptYesNo with inquirer
- [x] How to handle multiple hosts in `Remote` as well as facts in `Show`?
- [x] Write temporary facts to proper location vs hardcoded `/tmp/frey-facts` in `Show`
- [x] Use inquirer to select which hosts to connect to
- [x] Implement basic show
- [x] Implement remote
- [x] Abstract both Terraform and Ansible into App classes
- [x] Make dynamodb scnario a multi-files-project example
- [x] Let openstack scenario complete full Frey run
- [x] Implement setup
- [x] Implement deploy
- [x] Implement restart
- [x] Name encoded files `.cast5` vs `.enc`

## v0.3.3

Released: 2016-03-11.

- [x] Use internal cast5-cbc encryption vs shelling out to openssl
- [x] Automatic SSH private key reconstruction via encrypted file and FREY_ENCRYPTION_SECRET
- [x] Add basic toml formatter

## v0.3.2

Released: 2016-03-09.

- [x] Release v0.3.2
- [x] Add support for multi-files-project
- [x] Put most `paths` in `config`, and give them  more consistent names
- [x] Add library support so you can do `- role: ":frey:/consul/v1.0.0"`
- [x] Terminology: Project vs Config vs Options. No more recipe
- [x] Rename Launch to Infra
- [x] Remove config ambiguity and rename Compile to Config
- [x] Catch toml parsing errors in a nicer way (forget a quote, see what happens)
- [x] Deprecate `FREY__RUNTIME` in favor of `{{{}}}`
- [x] Rename ansibleCfg to settings (terraform parallelism is also a setting)
- [x] Make it so that any `FREY_` env var, is added as a ansible var and made available in env
- [x] Make it so that any `FREY_` env var, is added as a terraform `var` and made available in env
- [x] Add test scenario for compile
- [x] Move `terraform-parallelism` to global config
- [x] DRY up render (Prepare & Compile could share one implementation)
- [x] Strip Frey, move 'options.os' to Init (cliargs stay?). Remove options from constructors
- [x] Make `destroy` a feature of Frey so we don't have to rely on ENV vars in openstack `run.sh` destroy
- [-] Deprecate a generic `Step._buildChildEnv` in favor of more specific Ansible/Terraform env building
- [-] Make arg & env functions of all other steps, mimic Install's
- [x] All config should come from Freyfile (think ssh). env only used for secrets. argv only for cwd
- [x] Fix that `this.runtime.Runtime` is thing now. Remove `Runtime` alltogehter?
- [x] Let compile go before prepare so we can use (ssh) config in prepare

## v0.3.1

Released: 2016-02-19.

- [x] Implement install
- [x] Signify chained via ▽
- [x] Use FREY_TARGETS or swap out terraformInventory, to target localhost on Travis and some Vagrant box on OSX with `install`
- [x] Get rid of `iterable`. Can be replaced by `_.find` often
- [x] Use flatten in utils.render. Then we can replace `{{{self.version}}}` as well as `{{{options.foobar}}}`
- [x] Tools should be saved under version number only. This way different versions of frey can use their own tested tools, while also still being able to share between same frey installs
- [x] Upgrade Terraform 
- [x] Upgrade Terraform-inventory 
- [x] Upgrade Ansible 
- [x] Replace mustache with lodash templating
- [x] Put `_transform` in a central place (utils?)
- [x] New step: `frey compile` that's prefixed to any chain, so you can trust your updates are present in residu, and have its configuration available too (ssh user for instance)
- [x] Merge chain & steps
- [x] A project's package.json should refer to a frey version, which should be used, vs the global one.
- [x] Ansible must run from configBase
- [-] If you do a `frey install` you must trust that at least the Ansible files are re-compiled
- [-] Re-introduce `init` for local prepare. Such as converting Freyfile to residu. Should be prefixed to chain of steps. Then a single install can benefit from it (remove the `refresh` from that acceptance test) and validation can be ran against it/them
- [x] Frey should traverse cwd upwards until it finds a Freyfile, and use that as default project dir
- [x] Switch to local npm install if available via LiftOff
- [x] Consider storing residu files in ~/.frey/tmp/
- [x] Default appname should be basename of dirname of Freyfile, not pwd
- [x] replace IPs and UUIDs, it's possible to disable SKIP_COMPARE_STDIO on the openstack acceptace test
- [x] Enable Openstack support after https://github.com/adammck/terraform-inventory/issues/14
- [x] Coveralls
- [x] Chalk
- [x] Glob & extend all \*.toml. Infra = terraform Config = Ansible.
- [x] @boot can be a list of functions in an array that's passed to async.series
- [x] Get a tf -> tf.json to launch, before splitting out over yml/toml etc
- [x] Patch up toml -> json
- [x] Pave way to meaningful output without DEBUG
- [x] Prompt "Dare I install"? With --force-yes override
- [x] Move ansibleExe to deps
- [x] Move versions to deps
- [x] Port Prepare Instals
- [x] Linux workstation support (Travis ;))
- [x] tooldir should be coupled with global Frey install and not per-project
- [-] /step/module/ 
- [-] Class.run becomes Class.main. The new run is Base.run. Which does a waterfall of @boot[], then @main
- [x] Test & document --no-colors
- [x] Implement a bailAfter, use it for DynamoDB scenario
- [x] Amazon free tier dynamodb Travis tests 
- [x] Runtime can be a step module, which can be prefixed to the runChain. Prepare can also be prepended to all. Afterwards, scenarios won't need to be ordered
- [x] `./Freyfile.toml` ? This means projectdir defaults to `.`, and .git check should traverse upwards 'indefinitely'
- [x] Move validation to Validate class
- [x] Port Prepare SSH Keys
- [x] Port refresh
- [x] Port plan
- [x] Port launch
- [x] Port backup
- [x] Series/waterfall combination for boot 
- [x] Pass {} to first boot function. Use @options like all other methods to avoid confusion
- [x] Add (script to add) more encrypted cloud keys
- [x] exeScript should become exe. new exeScript prepends bash -o
- [x] Rename integration to acceptance (test) https://en.wikipedia.org/wiki/Acceptance_testing
- [x] terraform -parallelism=1
