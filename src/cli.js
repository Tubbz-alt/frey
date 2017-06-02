#!/usr/bin/env node
if (process.version.match(/^v?0\.10.*/)) {
  require('babel-polyfill')
}
const Frey = require('./Frey')
// const debug = require('depurar')('frey')
const yargs = require('yargs')
const chalk = require('chalk')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const LiftOff = require('liftoff')
const steps = require('./steps')
const _ = require('lodash')

updateNotifier({ pkg }).notify({ defer: false })

yargs
  .usage('Usage: frey <step> [options]')
  .example('frey backup -d ./envs/production', 'backup platform described in ./envs/production')
  .options({
    projectDir: {
      nargs   : 1,
      type    : 'string',
      describe: 'Directory that contains the Freyfile.hcl. Frey will traverse upwards if empty. ',
    },
    remote: {
      nargs   : 1,
      type    : 'string',
      describe: 'Step to execute on remote server. If ommited, remote opens an interactive shell. ',
    },
    'cfg-var': {
      nargs   : 1,
      type    : 'string',
      describe: 'Keys in your config to overwrite such as: --cfgVar="global.ssh.key_dir=/tmp" --cfgVar="global.terraformcfg.parallelism=2"',
    },
    'force-yes': {
      default : false,
      boolean : true,
      describe: 'Answer yes to all questions (dangerous!)',
    },
    target: { nargs: 1, type: 'string', describe: 'A Terraform target to execute in isolation' },
    tags  : { nargs: 1, type: 'string', describe: 'A list of Ansible tags to execute in isolation' },
    sleep : {
      default : 5,
      nargs   : 1,
      type    : 'number',
      describe: 'Wait x seconds between showing infra plan, and executing it',
    },
    bail        : { boolean: true, describe: 'Do not follow the chain of steps, run a one-off step' },
    'bail-after': {
      nargs   : 1,
      type    : 'string',
      describe: 'After running this step, abort the chain',
    },
    'no-color': { boolean: true, describe: 'Color support is detected, this forces colors off' },
    verbose   : { alias: 'v', count: true, describe: 'Show debug info' },
    unsafe    : {
      boolean : true,
      describe: 'Allow execution, even though your Git working directory is unclean',
    },
  })
  .command('completion', 'Install CLI auto completion')
  .epilog('Copyright 2016 Kevin van Zonneveld')
  .help('help')
  .wrap(yargs.terminalWidth())
  .version(() => {
    return pkg.version
  })

// First add chained steps, in order
for (let cmd of steps) {
  let description = `${cmd.description}`
  if (cmd.chained === true) {
    description = chalk.green('\u25BD ') + description
  }
  yargs.command(cmd.name, description)
}

// 'Execute' yargss
const argv = yargs.argv

if (argv._[0] === undefined) {
  argv._[0] = steps[0].name
}

// We override built-in completion step
if (argv._[0] === 'completion') {
  // we want to make sure we have the global /usr/local/bin/frey instead of
  // ../../../frey/bin/frey in the ~/.bash_profile
  yargs.showCompletionScript(process.env._)
  process.exit(0)
}

if (!_.find(steps, { name: argv._[0] })) {
  yargs.showHelp()
  console.error('')
  console.error(`Step '${argv._[0]}' is not recognized`)
  process.exit(1)
}

// For Frey, LiftOff:
//  - Scans for the closest Freyfile.hcl
//  - Switches to local npm install if available
const liftOff = new LiftOff({
  name        : 'frey',
  configName  : 'Freyfile',
  processTitle: 'frey',
  extensions  : { '.hcl': null },
})

liftOff.launch({ cwd: argv.projectDir }, ({ configBase }) => {
  if (configBase === undefined && argv._[0] !== 'convert' && argv._[0] !== 'help') {
    const msg = 'Could not find a Freyfile.hcl in current directory or upwards, or in project directory.'
    throw new Error(msg)
  }

  // Let LiftOff override the project dir
  argv.projectDir = argv.projectDir || configBase
  const frey = new Frey(argv)

  // Bombs away
  return frey.run(err => {
    if (err) {
      // yargs.showHelp()
      console.error('')
      console.error(`Exiting with error: ${err.message}`)
      if (err.details) {
        console.error('Details:')
        console.error('')
        console.error(err.details)
        console.error('')
      }
      process.exit(1)
      return
    }

    console.log('Done')
    return process.exit(0)
  })
})
