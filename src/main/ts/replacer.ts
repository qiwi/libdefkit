import {IReplacer} from './interface'

export const replaceExportMain: IReplacer = {
  from: '\texport = main;',
  to: ''
}

export const replaceImportMain: IReplacer = {
  from: /\timport main = require\('(.+)'\);/g,
  to: (line: string) => {
    const [, name] = /^\timport main = require\('(.+)'\);$/.exec(line) || []
    return `	export * from '${name}';`
  }
}

export const replaceBrokenModulePrefix: IReplacer = (pattern => ({
  from: pattern,
  to: (line: string) => {
    const [, module] = pattern.exec(line) || []
    return `${module}index' {`
  }
}))(/(declare module '.+\/target\/es5\/)[^/]*\/src\/main\/index'.+/)
