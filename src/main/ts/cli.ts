#!/usr/bin/env node

import meow from 'meow'

import { execute } from './libdefkit'

const cli = meow(
  `
    Usage:
      libdefkit --out=some/path/
    Options
      --cwd, working dir path
      --tsconfig
      --customTypings, attach custom libdefs to d.ts bundle
      --entry, alias entry (<pkgName>/target/es5/index by default)
      --dtsOut, dts output (typings/index.d.ts by default)
      --flowOut, flow output (flow-typed/index.flow.js by default)
`,
  {
    importMeta: import.meta,
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
      customTypings: {
        type: 'string',
        isMultiple: true,
      },
    },
  },
)

execute(cli.flags)
