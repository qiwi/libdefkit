/** @module @qiwi/libdefkit */

/** */
import cp, { StdioOptions } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import chalk from 'chalk'
import { findUpSync, pathExistsSync } from 'find-up'
import { packageDirectorySync } from 'pkg-dir'

import { ICmdInvokeOptions, TFlags } from './interface'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const STDIO_INHERIT: StdioOptions = ['inherit', 'inherit', 'inherit']
export const STDIO_NULL: StdioOptions = [null, null, null] // eslint-disable-line

export const getCmd = (
  cmd: string,
  cwd: string,
  closest?: boolean,
  isWin = process.platform === 'win32',
): string => {
  const _cmd = cmd + (isWin ? '.cmd' : '')

  return closest ? getClosestBin(_cmd, cwd) : _cmd
}

export const invoke = ({
  cmd,
  args = [],
  cwd = process.cwd(),
  silent = false,
  closest,
  stdio = STDIO_INHERIT,
}: ICmdInvokeOptions): string => {
  const _cmd = getCmd(cmd, cwd, closest)
  const _args = formatArgs(args)

  !silent && console.log(chalk.bold('invoke'), _cmd, ..._args)

  const result = cp.spawnSync(_cmd, _args, { cwd, stdio })

  if (result.error || result.status) {
    throw Object.assign(new Error(result.stderr.toString().trim()), result)
  }

  return result.stdout?.toString().trim() ?? result.stdout
}

const checkValue = (
  key: string,
  value: TFlags[string],
  omitlist: string[],
  picklist: string[],
): boolean =>
  value !== 'false' &&
  !omitlist.includes(key) &&
  (picklist.length === 0 || picklist.includes(key))

const formatFlag = (key: string): string =>
  (key.length === 1 ? '-' : '--') + key

export const formatFlags = (
  flags: TFlags = {},
  picklist: string[] = [],
): string[] =>
  Object.keys(flags).reduce<string[]>((memo, key: string) => {
    const omitlist = ['_', '--']
    const value = flags[key]
    const flag = formatFlag(key)

    if (checkValue(key, value, omitlist, picklist)) {
      ;[value].flat().forEach((v) => {
        memo.push(flag)

        if (v !== true) {
          memo.push(v + '')
        }
      })
    }

    return memo
  }, [])

export const formatArgs = (
  args: string[] | TFlags = {},
  picklist?: string[],
): string[] => (Array.isArray(args) ? args : formatFlags(args, picklist))

export const findBin = (cmd: string, cwd: string) =>
  findUpSync(
    (dir) => {
      const ref = resolve(dir, 'node_modules', '.bin', cmd)

      return pathExistsSync(ref) ? ref : undefined
    },
    { cwd, type: 'file', allowSymlinks: true },
  )

export const getClosestBin = (
  cmd: string,
  cwd: string = process.cwd(),
): string =>
  findBin(cmd, cwd) ||
  findBin(cmd, packageDirectorySync({ cwd: __dirname }) as string) ||
  cmd
