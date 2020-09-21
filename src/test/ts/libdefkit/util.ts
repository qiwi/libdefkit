import {resolve} from 'path'
import parseArguments from 'yargs-parser'
import {
  formatFlags,
  // invoke,
  getClosestBin,
} from '../../../main/ts/libdefkit/util'

describe('util', () => {
  describe('#formatArgs', () => {
    it('return proper values', () => {
      const cases: [Record<string, any>, string[], string[]][] = [
        [{_: [], '--': []}, [], []],
        [{foo: 'bar'}, [], ['--foo', 'bar']],
        [{f: true}, [], ['-f']],
        [{verbose: true}, [], ['--verbose']],
        [{f: true, foo: 'bar', b: true, baz: 'qux'}, ['f', 'baz'], ['-f', '--baz', 'qux']],
        [
          parseArguments([
            '-w',
            '1',
            '--force',
            '--audit-level=moderate',
            '--only=dev',
            '--',
            '--bar',
            '-b',
            '2',
          ]),
          ['force', 'audit-level', 'only', 'bar', 'b'],
          ['--force', '--audit-level', 'moderate', '--only', 'dev'],
        ],
      ]

      cases.forEach(([input, picklist, output]) => {
        expect(formatFlags(input, ...picklist)).toEqual(output)
      })
    })
  })

  describe('#getClosestBin', () => {
    it('properly resolves cmd refs', () => {
      const cases: [string, string][] = [
        ['npm', resolve(__dirname, '../../../../node_modules/.bin/npm')],
        ['tsc', resolve(__dirname, '../../../../node_modules/.bin/tsc')],
      ]

      cases.forEach(([cmd, ref]) => {
        expect(getClosestBin(cmd)).toBe(ref)
      })
    })
  })
})
