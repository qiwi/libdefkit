import {execute} from '../../main/ts'
import {resolve, join} from 'path'

describe('libdefkit', () => {
  describe('#execute', () => {
    it('returns proper dts bundle', () => {
      const temp = resolve(__dirname, '..', 'temp')
      const dtsOut = join(temp, 'index.d.ts')
      const flowOut = join(temp, 'index.flow.js')
      const cwd = process.cwd()
      const result = execute({
        tsconfig: [
          'tsconfig.es5.json',
          'tsconfig.es6.json',
        ],
        dtsOut,
        flowOut,
      })
      const snap = JSON.parse(JSON.stringify(result).replace(new RegExp(cwd, 'g'), '<cwd>'))

      expect(snap).toMatchSnapshot()
    })
  })
})
