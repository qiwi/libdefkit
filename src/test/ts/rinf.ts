import {resolve} from 'path'
import {IReplacer} from '../../main/ts/interface'
import {
  getRinfConfig,
  splitReplacers,
} from '../../main/ts/rinf'

describe('rinf', () => {
  it('#getRinfConfig', () => {
    const dts = resolve(__dirname, '../fixtures/input.d.ts')
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
})
