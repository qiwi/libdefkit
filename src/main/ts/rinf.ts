import {resolve} from 'path'
import assert from 'assert'
import {readFileSync} from 'fs'
import {
  ReplaceInFileConfig,
  From,
  To,
  replaceInFileSync,
  ReplaceResult,
} from 'replace-in-file'

import {
  initReplacers,
  replaceExportMain,
  replaceImportMain,
  replaceBrokenModulePrefix,
  replaceModuleTypeRefs,
  replaceEmptyLines,
  replaceLocalModulesScope,
} from './replacer'
import {logger} from './logger'
import {IReplacer, IRunnerOpts} from './interface'

export const rinf = (opts: IRunnerOpts) => {
  const {dts, prefix} = opts
  assert(!!dts, '`--dts` file path should be specified')
  assert(!!prefix, 'entry point `--prefix` should be specified')

  const cfg = getRinfConfig(opts)
  const result: ReplaceResult[] = replaceInFileSync(cfg)

  logger.info('Modified,', result)
}

export const getRinfConfig = ({dts, prefix}: IRunnerOpts): ReplaceInFileConfig => {
  const dtsPath = resolve(dts)
  const dtsData = readFileSync(dtsPath, 'utf-8')
  const replacers = initReplacers([
    replaceExportMain,
    replaceImportMain,
    replaceBrokenModulePrefix,
    replaceModuleTypeRefs,
    replaceEmptyLines,
    replaceLocalModulesScope,
  ], {prefix, dtsData})

  const {from, to} = splitReplacers(replacers)

  return {
    files: dtsPath,
    from,
    to,
  }
}

export const splitReplacers = (replacers: IReplacer[]) => replacers
  .reduce<{from: From[], to: To[]}>((m, {from, to}) => {
    m.from.push(from)
    m.to.push(to)

    return m
  }, {from: [], to: []})
