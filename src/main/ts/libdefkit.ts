/** @module @qiwi/libdefkit */

/** */
import { join } from 'node:path'

import fs from 'fs-extra'
import { temporaryDirectory } from 'tempy'

import { pipe as dtsgen } from './dts.js'
import { ICliFlags, IContext, IExecPipe } from './interface.js'
import { invoke } from './util.js'

export const normalize: IExecPipe = (flags: ICliFlags): IContext => {
  const cwd = flags.cwd || process.cwd()
  const cache = temporaryDirectory()
  const temp = temporaryDirectory()
  const name = fs.readJsonSync(join(cwd, 'package.json')).name
  const entry = flags.entry ?? `./index.ts`
  const ext = flags.ext ?? '.js'
  const dtsOut = flags.dtsOut === 'false'
    ? join(temp, 'index.d.ts')
    : flags.dtsOut ?? join(cwd, 'typings', 'index.d.ts')
  const flowOut = flags.flowOut === 'false'
    ? join(temp, 'index.flow.js')
    : flags.flowOut ?? join(cwd, 'flow-typed', 'index.flow.js')

  return { cache, ...flags, cwd, name, entry, ext, dtsOut, flowOut }
}

export const clear: IExecPipe = (ctx) => {
  fs.emptyDirSync(ctx.cache)
}

export const flowgen: IExecPipe = ({ dtsOut, flowOut }): void => {
  if (dtsOut && flowOut) {
    invoke({
      cmd: 'flowgen',
      args: [dtsOut, '--output-file', flowOut],
      closest: true,
    })
  }
}

export const pipeline: IExecPipe[] = [normalize, clear, dtsgen, flowgen, clear]

export const execute = (flags: ICliFlags): IContext =>
  pipeline.reduce((ctx, pipe) => pipe(ctx) || ctx, flags as IContext)
