import {IReplacer, IReplacerFactory} from './interface'

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

export const replaceModuleTypeRefs: IReplacer = {
  from: /\/\/\/.+/,
  to: ''
}

export const replaceEmptyLines: IReplacer = {
  from: /^\s*[\r\n]/gm,
  to: ''
}

export const replaceLocalModulesScope: IReplacerFactory = ({dtsData, prefix}) => {
  const declaredModules = (dtsData.match(/declare module '.*'/g) || []).map(v => v.slice(16, -1))

  return {
    from: /import .+ from '(.+)'/g,
    to: (line: string) => {
      const re = /^(.+from ')([^']+)('.*)$/
      const [, pre, module, post] = re.exec(line) || []
      const name = declaredModules.includes(module)
        ? module
        : module.replace(prefix + '/', '')

      return `${pre}${name}${post}`
    }
  }
}
