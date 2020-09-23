import {execute} from '../../main/ts'

describe('libdefkit', () => {
  describe('#execute', () => {
    it('returns proper dts bundle', () => {
      expect(execute({
        tsconfig: [
          'tsconfig.es5.json',
          'tsconfig.es6.json',
        ],
      })).toMatchSnapshot()
    })
  })
})
