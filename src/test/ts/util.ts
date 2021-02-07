import cp from 'child_process'
import fs from 'fs-extra'
import { resolve } from 'path'
import parseArguments from 'yargs-parser'

import { ICmdInvokeOptions } from '../../main/ts/interface'
import {
  formatArgs,
  getClosestBin,
  invoke,
  STDIO_INHERIT,
  STDIO_NULL,
} from '../../main/ts/util'

jest.mock('child_process')
jest.mock('fs-extra')

describe('util', () => {
  const dotcmd = process.platform === 'win32' ? '.cmd' : ''

  describe('#invoke', () => {
    beforeEach(() => {
      // @ts-ignore
      jest.spyOn(process, 'exit').mockImplementation(() => {
        /* noop */
      })
      // @ts-ignore
      fs.existsSync.mockImplementation((cmd) => cmd !== 'not-found' + dotcmd)
      // @ts-ignore
      cp.spawnSync.mockImplementation((cmd) => {
        const results: Record<string, any> = {
          error: { status: 1, stderr: 'some error' },
          def: { status: 0, stdout: 'foobar' },
          null: { status: 0, stdout: null },
        }

        return results[cmd.replace(dotcmd, '')] || results.def
      })
    })
    afterEach(jest.clearAllMocks)
    afterAll(() => {
      jest.unmock('fs-extra')
      jest.unmock('child_process')
    })

    const cases: [
      string,
      ICmdInvokeOptions,
      string?,
      (string | null)?,
      any?,
    ][] = [
      ['uses global cmd ref', { cmd: 'tsc' }, 'tsc'],
      [
        'uses local (closest) cmd ref',
        { cmd: 'tsc', closest: true },
        resolve(__dirname, '../../../node_modules/.bin/tsc'),
      ],
      ['handles flags (record) as args', { cmd: 'tsc', args: {} }],
      ['supports custom cwd', { cmd: 'tsc', cwd: '/foo/bar' }],
      [
        'returns stdout as a result',
        { cmd: 'tsc', silent: true },
        'tsc',
        'foobar',
      ],
      [
        'returns null if stdout is null',
        { cmd: 'null', silent: true },
        'null',
        null,
      ],
      [
        'throws error if result.signal is not equal 0',
        { cmd: 'error', stdio: STDIO_NULL },
        'error',
        undefined,
        { status: 1, stderr: 'some error' },
      ],
    ]

    cases.forEach(
      ([description, opts, expectedCmd, expectedResult, expectedError]) => {
        it(description, () => {
          const expectedArgs = formatArgs(opts.args)
          const expectedOpts = {
            cwd: opts.cwd || process.cwd(),
            stdio: opts.stdio || STDIO_INHERIT,
          }

          if (expectedError) {
            expect(() => invoke(opts)).toThrowError(new Error(expectedError))
          } else {
            expect(invoke(opts)).toEqual(
              expectedResult === null ? expectedResult : expect.any(String),
            )
          }

          expectedCmd &&
            expect(cp.spawnSync).toHaveBeenCalledWith(
              expectedCmd + dotcmd,
              expectedArgs,
              expectedOpts,
            )
        })
      },
    )
  })

  describe('#formatArgs', () => {
    it('return proper values', () => {
      const cases: [Record<string, any>, string[], string[]][] = [
        [{ _: [], '--': [] }, [], []],
        [{ foo: 'bar' }, [], ['--foo', 'bar']],
        [{ f: true }, [], ['-f']],
        [{ verbose: true }, [], ['--verbose']],
        [
          { f: true, foo: 'bar', b: true, baz: 'qux' },
          ['f', 'baz'],
          ['-f', '--baz', 'qux'],
        ],
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
        expect(formatArgs(input, picklist)).toEqual(output)
      })
    })
  })

  describe('#getClosestBin', () => {
    it('properly resolves cmd refs', () => {
      const cases: [string, string | undefined][] = [
        ['npm', 'npm'],
        ['tsc', resolve(__dirname, '../../../node_modules/.bin/tsc')],
        ['not-found', 'not-found'],
      ]
      cases.forEach(([cmd, ref]) => {
        expect(getClosestBin(cmd + dotcmd)).toBe(ref + dotcmd)
      })
    })
  })
})
