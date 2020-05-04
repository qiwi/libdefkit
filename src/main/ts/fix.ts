import {resolve} from 'path'
import { argv } from 'yargs'
import assert from 'assert'
import rep, {ReplaceInFileConfig, replaceInFileSync, ReplaceResult} from 'replace-in-file'
import {readFileSync} from 'fs'

const {dts, prefix} = argv
const DTS = resolve(dts as string)
const IMPORT_MAIN_PATTERN = /\timport main = require\('(.+)'\);/g
const IMPORT_MAIN_LINE_PATTERN = /^\timport main = require\('(.+)'\);$/
const BROKEN_MODULE_NAME = /(declare module '.+\/target\/es5\/)[^/]*\/src\/main\/index'.+/
const IMPORT = /import .+ from '(.+)'/g
const REFERENCE = /\/\/\/.+/

assert(!!dts, ' `dts` file path should be specified')

const dtsFile = readFileSync(DTS, 'utf-8')
const declaredModules = (dtsFile.match(/declare module '.*'/g) || []).map(v => v.slice(16, -1))

// console.log(declaredModules)
console.log(rep.sync)

const options: ReplaceInFileConfig = {
  files: DTS,
  from: [
    '\texport = main;',
    IMPORT_MAIN_PATTERN,
    BROKEN_MODULE_NAME,
    REFERENCE,
    /^\s*[\r\n]/gm,
    IMPORT
  ],
  to: [
    '',
    (line: string) => {
      const [, name] = IMPORT_MAIN_LINE_PATTERN.exec(line) || []
      return `	export * from '${name}';`
    },
    (line: string) => {
      const [, module] = BROKEN_MODULE_NAME.exec(line) || []
      return `${module}index' {`
    },
    '',
    '',
    (line: string) => {
      const re = /^(.+from ')([^']+)('.*)$/
      const [, pre, module, post] = re.exec(line) || []
      const name = declaredModules.includes(module)
        ? module
        : module.replace(prefix + '/', '')

      return `${pre}${name}${post}`
    }
  ],
}

const changes: ReplaceResult[] = replaceInFileSync(options);
console.log('Modified files:', changes);
