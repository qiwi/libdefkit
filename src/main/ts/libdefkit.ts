/** @module @qiwi/libdefkit */
/** */

import fs from 'fs-extra'
import { join } from 'node:path'
import { temporaryDirectory } from 'tempy'

import { pipe as dtsgen } from './dts'
import { ICliFlags, IContext, IExecPipe } from './interface'
import { invoke } from './util'

export const normalize: IExecPipe = (flags: ICliFlags): IContext => {
  const cwd = flags.cwd || process.cwd()
  const cache = temporaryDirectory()
  const name = fs.readJsonSync(join(cwd, 'package.json')).name
  const entry = flags.entry ?? `${name}/target/es6`
  const dtsOut = flags.dtsOut ?? join(cwd, 'typings', 'index.d.ts')
  const flowOut = flags.flowOut ?? join(cwd, 'flow-typed', 'index.flow.js')

  return { cache, ...flags, cwd, name, entry, dtsOut, flowOut }
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
