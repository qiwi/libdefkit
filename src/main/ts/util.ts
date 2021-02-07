/** @module @qiwi/libdefkit */
/** */

import chalk from 'chalk'
import cp, { StdioOptions } from 'child_process'
import { sync as findUp } from 'find-up'
import fs from 'fs-extra'
import { resolve } from 'path'
import { sync as pkgDir } from 'pkg-dir'

import { ICmdInvokeOptions } from './interface'

export const STDIO_INHERIT: StdioOptions = ['inherit', 'inherit', 'inherit']
export const STDIO_NULL: StdioOptions = [null, null, null] // eslint-disable-line

export const getCmd = (
  cmd: string,
  closest?: boolean,
  isWin = process.platform === 'win32',
): string => {
  const _cmd = cmd + (isWin ? '.cmd' : '')

  return closest ? getClosestBin(_cmd) : _cmd
}

export const invoke = ({
  cmd,
  args = [],
  cwd = process.cwd(),
  silent = false,
  closest,
  stdio = STDIO_INHERIT,
}: ICmdInvokeOptions): string => {
  const _cmd = getCmd(cmd, closest)
  const _args = formatArgs(args)

  !silent && console.log(chalk.bold('invoke'), _cmd, ..._args)

  const result = cp.spawnSync(_cmd, _args, { cwd, stdio })

  if (result.error || result.status) {
    throw result
  }

  return result.stdout?.toString().trim() ?? result.stdout
}

const checkValue = (
  key: string,
  value: any,
  omitlist: any[],
  picklist: any[],
): boolean =>
  value !== 'false' &&
  !omitlist.includes(key) &&
  (picklist.length === 0 || picklist.includes(key))

const formatFlag = (key: string): string =>
  (key.length === 1 ? '-' : '--') + key

export const formatFlags = (
  flags: Record<string, any> = {},
  picklist: string[] = [],
): string[] =>
  Object.keys(flags).reduce<string[]>((memo, key: string) => {
    const omitlist = ['_', '--']
    const value = flags[key]
    const flag = formatFlag(key)

    if (checkValue(key, value, omitlist, picklist)) {
      memo.push(flag)

      if (value !== true) {
        memo.push(value)
      }
    }

    return memo
  }, [])

export const formatArgs = (
  args: Record<string, any> | string[] = {},
  picklist?: string[],
): string[] => (Array.isArray(args) ? args : formatFlags(args, picklist))

export const getClosestBin = (
  cmd: string,
  cwd: string = pkgDir(__dirname) + '',
): string =>
  findUp(
    (dir) => {
      const ref = resolve(dir, 'node_modules', '.bin', cmd)

      return fs.existsSync(ref) ? ref : undefined
    },
    { cwd },
  ) || cmd
