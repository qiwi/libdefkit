/** @module @qiwi/libdefkit */
/** */

import { StdioOptions } from 'node:child_process'

export type ICmdInvokeOptions = {
  cmd: string
  args?: string[] | TFlags
  cwd?: string
  silent?: boolean
  stdio?: StdioOptions
  closest?: boolean
}

export type ICliFlags = {
  cwd?: string
  entry?: string
  dtsOut?: string
  flowOut?: string
  tsconfig?: string[]
  customTypings?: string[]
  cache?: string
}

export type IContext = ICliFlags & {
  cache: string
  cwd: string
  name: string
} & TFlags

export type TFlags = Record<string, string | boolean | number | Array<string | boolean | number>>

export type IExecPipe = (ctx: IContext) => IContext | void
