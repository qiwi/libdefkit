import cp from 'node:child_process'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { jest } from '@jest/globals'
import fse from 'fs-extra'
import parseArguments from 'yargs-parser'

import { ICmdInvokeOptions, TFlags } from '../../main/ts/interface.js'
import {
  formatArgs,
  getClosestBin,
  invoke,
  STDIO_INHERIT,
  STDIO_NULL,
} from '../../main/ts/util'

const dotcmd = process.platform === 'win32' ? '.cmd' : ''
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const spawnResult = ({ status = 0, stdout = '', stderr = '' } = {}): ReturnType<
  typeof cp.spawnSync
> => ({
  status,
  stdout: Buffer.from(stdout),
  stderr: Buffer.from(stderr),
  pid: process.pid,
  signal: null,
  output: [],
})
const fakeExistsSync = jest.fn((cmd) => cmd !== 'not-found' + dotcmd)
const fakeSpawnSync = jest.fn((cmd: string) => {
  const results: Record<string, ReturnType<typeof cp.spawnSync>> = {
    error: spawnResult({ status: 1, stderr: 'some error' }),
    def: spawnResult({ stdout: 'foobar' }),
    empty: spawnResult({ stdout: '' }),
  }

  return results[cmd.replace(dotcmd, '')] || results.def
})

beforeAll(() => {
  jest.spyOn(cp, 'spawnSync').mockImplementation(fakeSpawnSync)
  jest.spyOn(fse, 'existsSync').mockImplementation(fakeExistsSync)
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never)
})
afterEach(jest.clearAllMocks)
afterAll(jest.resetAllMocks)

describe('util', () => {
  const dotcmd = process.platform === 'win32' ? '.cmd' : ''

  describe('#invoke', () => {
    const cases: [
      string,
      ICmdInvokeOptions,
      string?,
      (string | null)?,
      (Parameters<typeof spawnResult>[0] | null)?,
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
        'returns "" if stdout is empty',
        { cmd: 'empty', silent: true },
        'empty',
        '',
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
            expect(() => invoke(opts)).toThrowError(
              new Error(expectedError.stderr?.toString()),
            )
          } else {
            expect(invoke(opts)).toEqual(
              expectedResult === null ? expectedResult : expect.any(String),
            )
          }

          expectedCmd &&
            expect(fakeSpawnSync).toHaveBeenCalledWith(
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
      const cases: [TFlags, string[], string[]][] = [
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
