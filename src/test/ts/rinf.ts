import {resolve} from 'path'
import {copyFileSync, readFileSync} from 'fs'
import {IReplacer} from '../../main/ts/interface'
import {
  rinf,
  getRinfConfig,
  splitReplacers,
} from '../../main/ts/rinf'

describe('rinf', () => {
  const inputDtsPath = resolve(__dirname, '../fixtures/input.d.ts')
  const outputDtsPath = resolve(__dirname, '../fixtures/output.d.ts')
  const tempDtsPath = resolve(__dirname, '../temp/index.d.ts')

  it('#getRinfConfig', () => {
    const dts = inputDtsPath
    const prefix = '@qiwi/decorator-utils/target/es5'
    const cxt = {dts, prefix}
    const cfg = getRinfConfig(cxt)

    expect(cfg).toEqual({
      files: dts,
      from: expect.any(Array),
      to: expect.any(Array),
    })
  })

  it('#splitReplacers', () => {
    const replacer1: IReplacer = { from: '1', to: '11'}
    const replacer2: IReplacer = { from: '2', to: '22'}

    expect(splitReplacers([replacer1, replacer2])).toEqual({
      from: ['1', '2'],
      to: ['11', '22'],
    })
  })

  it('#rinf modifies target file', () => {
    copyFileSync(inputDtsPath, tempDtsPath)

    expect(readFileSync(tempDtsPath, 'utf-8')).toBe(readFileSync(inputDtsPath, 'utf-8'))

    const dts = tempDtsPath
    const prefix = '@qiwi/decorator-utils/target/es5'
    const cxt = {dts, prefix}

    rinf(cxt)

    expect(readFileSync(tempDtsPath, 'utf-8')).toBe(readFileSync(outputDtsPath, 'utf-8'))
  })
})
