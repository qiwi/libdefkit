import {resolve} from 'path'
import {readFileSync} from 'fs'
import {
  initReplacers,
  replaceExportMain,
  replaceImportMain,
  replaceBrokenModulePrefix,
  replaceModuleTypeRefs,
  replaceEmptyLines,
  replaceLocalModulesScope
} from './replacer'

import {IReplacer, IRunnerOpts} from './interface'
import {From, ReplaceInFileConfig, To} from 'replace-in-file'

export const getRinfConfig = ({dts, prefix}: IRunnerOpts): ReplaceInFileConfig => {
  const dtsPath = resolve(dts)
  const dtsData = readFileSync(dtsPath, 'utf-8') as string
  const replacers = initReplacers([
    replaceExportMain,
    replaceImportMain,
    replaceBrokenModulePrefix,
    replaceModuleTypeRefs,
    replaceEmptyLines,
    replaceLocalModulesScope
  ], {prefix, dtsData})

  const {from, to} = splitReplacers(replacers)

  return {
    files: dtsPath,
    from,
    to
  }
}

export const splitReplacers = (replacers: IReplacer[]) => replacers
  .reduce<{from: From[], to: To[]}>((m, {from, to}) => {
    m.from.push(from)
    m.to.push(to)

    return m
  }, {from: [], to: []})
