/** @module @qiwi/libdefkit */
/** */

import {StdioOptions} from 'child_process'

export type ICmdInvokeOptions = {
  cmd: string
  args?: string[] | Record<string, any>,
  cwd?: string,
  silent?: boolean,
  stdio?: StdioOptions,
  closest?: boolean
}

export type ICliFlags = {
  cwd?: string
  entry?: string,
  dtsOut?: string,
  flowOut?: string,
  tsconfig?: string[]
}

export type IContext = ICliFlags & {
  cache: string
  cwd: string
  name: string,
  [key: string]: any
}

export type IExecPipe = (ctx: IContext) => IContext | void
