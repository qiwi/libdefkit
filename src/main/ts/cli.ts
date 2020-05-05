import meow from 'meow'
import {rinf} from '.'

const cli = meow(`
  Usage
    $ libdeffix --dts {dts file path} --prefix {entry point prefix}

  Options
    --dts       Target *.d.ts file path
    --prefix    Entry point path prefix

  Examples
    $ libdeffix --dts ./typings/index.d.ts --prefix @qiwi/decorator-utils/target/es5
    $ libdeffix --version
    $ libdeffix --help
`, {
  flags: {
    dts: {
      type: 'string',
    },
    prefix: {
      type: 'string',
    },
  },
})

rinf(cli.flags)
