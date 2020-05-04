import {IReplacer} from '../../main/ts/interface'
import {
  replaceExportMain,
  replaceImportMain,
  replaceBrokenModulePrefix,
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
  }

  it('#replaceExportMain', () => {
    assertReplacement(replaceExportMain, '\texport = main;', 'bar')
  })

  it('#replaceImportMain', () => {
    assertReplacement(
      replaceImportMain,
      '	import main = require(\'foo\');',
      '	export * from \'foo\';')
  })

  it('#replaceBrokenModulePrefix', () => {
    assertReplacement(
      replaceBrokenModulePrefix,
      'declare module \'@qiwi/foo/target/es5//src/main/index\' {',
      'declare module \'@qiwi/foo/target/es5/index\' {')
  })
})
