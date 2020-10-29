#!/usr/bin/env node

import meow from 'meow'
import {execute} from './libdefkit'

const cli = meow(`
    Usage:
      libdefkit --out=some/path/
    Options
      --cwd, working dir path
      --tsconfig
      --entry, alias entry (<pkgName>/target/es5/index by default)
      --dtsOut, dts output (typings/index.d.ts by default)
      --flowOut, flow output (flow-typed/index.flow.js by default)
`, {
  flags: {
    cwd: {
      type: 'string',
    },
    dtsOut: {
      type: 'string',
    },
    flowOut: {
      type: 'string',
    },
    tsconfig: {
      type: 'string',
      isMultiple: true,
    },
  },
})

execute(cli.flags)
