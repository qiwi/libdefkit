#!/usr/bin/env node
import meow from 'meow'

import { execute } from './libdefkit.js'

const cli = meow(
  `
    Usage:
      libdefkit --out=some/path/
    Options
      --cwd, working dir path
      --tsconfig
      --customTypings, attach custom libdefs to d.ts bundle
      --entry, pkg entry point (<pkgName>/index by default)
      --ext, extension to use in module declarations (default: .js)
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
      cache: {
        type: 'string',
      },
      entry: {
        type: 'string',
      },
      ext: {
        type: 'string',
      },
    },
  },
)

execute(cli.flags)
