import {resolve} from 'path'
import cp, {StdioOptions} from 'child_process'
import fs from 'fs-extra'
import chalk from 'chalk'
import {sync as pkgDir} from 'pkg-dir'
import {sync as findUp} from 'find-up'

export const invoke = (cmd: string, args: string[], cwd: string, silent= false, inherit = true) => {
  !silent && console.log(chalk.bold('invoke'), cmd, ...args)

  const stdio: StdioOptions = inherit ? ['inherit', 'inherit', 'inherit'] : [null, null, null]
  const result = cp.spawnSync(cmd, args, {cwd, stdio})

  if (result.error || result.status) {
    throw result
  }

  return result.stdout?.toString().trim()
}

const checkValue = (key: string, value: any, omitlist: any[], picklist: any[]): boolean =>
  value !== 'false' && !omitlist.includes(key) && (!picklist.length || picklist.includes(key))

const formatFlag = (key: string): string => (key.length === 1 ? '-' : '--') + key

export const formatFlags = (flags: Record<string, any>, ...picklist: string[]): string[] =>
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

export const getClosestBin = (cmd: string): string => {
  const pkgRoot = pkgDir(__dirname) + ''

  return findUp(dir => {
    const ref = resolve(dir, 'node_modules', '.bin', cmd)

    return fs.existsSync(ref) ? ref : undefined
  }, {cwd: pkgRoot}) + ''
}
