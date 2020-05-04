import {IReplacer} from '../../main/ts/interface'
import {
  replaceExportMain,
  replaceImportMain,
  replaceBrokenModulePrefix,
  replaceModuleTypeRefs,
  replaceEmptyLines,
  replaceLocalModulesScope,
} from '../../main/ts/replacer'

describe('replacer', () => {
  const assertReplacement = ({from, to}: IReplacer, input: string, output: string) => {
    if (from instanceof RegExp) {
      expect(from.test(input)).toBeTruthy()
    }

    if (typeof from === 'string') {
      expect(input.includes(from)).toBeTruthy()
    }

    if (typeof to === 'function') {
      expect(to(input, '')).toBe(output)
    }

    if (typeof to === 'string') {
      expect(to).toBe(output)
    }
  }

  it('#replaceExportMain', () => {
    assertReplacement(replaceExportMain, '\texport = main;', '')
  })

  it('#replaceImportMain', () => {
    assertReplacement(
      replaceImportMain,
      '	import main = require(\'foo\');',
      '	export * from \'foo\';'
    )
  })

  it('#replaceBrokenModulePrefix', () => {
    assertReplacement(
      replaceBrokenModulePrefix,
      'declare module \'@qiwi/foo/target/es5//src/main/index\' {',
      'declare module \'@qiwi/foo/target/es5/index\' {')
  })

  it('#replaceModuleTypeRefs', () => {
    assertReplacement(
      replaceModuleTypeRefs,
      '/// <reference path="./common/common.d.ts" />',
      ''
    )
  })

  it('#replaceEmptyLines', () => {
    assertReplacement(
      replaceEmptyLines,
      `  
`,
      ''
    )
  })

  it('#replaceLocalModulesScope', () => {
    const dtsData = `
declare module '@qiwi/decorator-utils/target/es5/utils' {
\t/** @module @qiwi/decorator-utils */
\timport { IInstance } from '@qiwi/decorator-utils/target/es5/interface';
\timport get from '@qiwi/decorator-utils/target/es5/lodash.get';
\timport set from '@qiwi/decorator-utils/target/es5/lodash.set';
\texport { get, set, };

\texport function getPrototypeMethods(instance: IInstance): PropertyDescriptorMap;
}
`
    const prefix = '@qiwi/decorator-utils/target/es5'
    const replacer = replaceLocalModulesScope({dtsData, prefix})
    assertReplacement(
      replacer,
      `\timport get from '@qiwi/decorator-utils/target/es5/lodash.get';`,
      `\timport get from 'lodash.get';`
    )
  })
})
