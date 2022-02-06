import '@jest/globals'

import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'path'

import { execute } from '../../main/ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('libdefkit', () => {
  describe('#execute', () => {
    it('returns proper dts bundle', () => {
      const temp = resolve(__dirname, '..', 'temp')
      const cache = join(temp, 'cache')
      const dtsOut = join(temp, 'index.d.ts')
      const flowOut = join(temp, 'index.flow.js')
      const result = execute({
        tsconfig: ['tsconfig.es6.json'],
        dtsOut,
        flowOut,
        customTypings: ['customTypings/**/*.d.ts'],
        cache,
      })

      const cwd = JSON.stringify(process.cwd()).slice(1, -1)
      const snap = JSON.parse(
        JSON.stringify(result)
          .replaceAll(cwd, '<cwd>')
          .replace(/\\\\/g, '/')
      )
      snap.cwd = '<cwd>'
      snap.cache = '<cache>'

      expect(snap).toMatchSnapshot()
    })
  })
})
