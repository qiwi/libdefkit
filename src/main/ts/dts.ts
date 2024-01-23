/** @module @qiwi/libdefkit */

/** */
import path from 'node:path'
import process from 'node:process'

import fse from 'fs-extra'
import { globbySync } from 'globby'
import { nanoid } from 'nanoid'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { depseekSync } from 'depseek'

import { IContext, IExecPipe } from './interface.js'
import { invoke } from './util.js'

export const generate = (
  tsconfig: string,
  tempDir: string,
  name: string,
): string => {
  const cfg = fse.readJsonSync(tsconfig)
  const outDir = cfg?.compilerOptions?.outDir || ''
  const genDir = path.join(tempDir, `libdefkit-${nanoid()}`)

  fse.ensureDirSync(genDir)

  invoke({
    cmd: 'tsc',
    args: {
      p: tsconfig,
      declaration: true,
      emitDeclarationOnly: true,
      outDir: genDir,
      removeComments: true,
    },
    closest: true,
  })

  const files = globbySync(['**/*.d.ts'], {
    onlyFiles: true,
    absolute: true,
    cwd: genDir,
  })

  return mergeDts({
    files,
    root: genDir,
    prefix: path.join(name, outDir)
  })
}

export const mergeDts = ({files, root = process.cwd(), prefix = ''}: {files: string[], root?: string, prefix?: string}): string =>
  files.reduce(
    (m: string, f: string) => {
      const contents = fse.readFileSync(f, { encoding: 'utf-8' })
      const relName = path.relative(root, f)
      const relBase = path.dirname(relName)
      const moduleName = `${prefix}/${relName.slice(0, -5)}`
      const ctx = {relName, relBase, contents, prefix}
      const _contents = `declare module '${moduleName}' {
${fixModuleReferences(ctx)}
}

`
      return m + _contents
    },
    '',
  )

export const mixFiles = (files: string[], memo = ''): string =>
  files.reduce(
    (m: string, f: string) => m + fse.readFileSync(f, { encoding: 'utf-8' }),
    memo,
  )

export const fixModuleReferences = (ctx: {relName: string, relBase: string, contents: string, prefix: string}): string => {
  const { contents, relBase , prefix} = ctx
  const deps = depseekSync(contents)
  let pos = 0
  let _contents = ''

  for (const {index, value} of deps) {
    const len = value.length
    const v = value.endsWith('/') ? value.slice(0, -1) : value
    const _value = (v.includes('/') || v === '.' || v === '..')
      ? path.join(prefix, relBase, v)
      : value

    _contents = _contents + contents.slice(pos, index) + _value
    pos = index + len
  }
  _contents = _contents + contents.slice(pos)

  return fixLines(_contents)
}

const fixLines = (input: string): string => input.split('\n').map(l => fixLine(l)).join('\n')

const fixLine = (l: string) => fixTabs(fixShebang(fixExportDeclare(l)))

const fixTabs = (l: string, symbol = '  ', n = 2): string => `${symbol.repeat(n)}${l}`

const fixExportDeclare = (l: string): string => l.startsWith('export declare ') ? `export ${l.slice(15)}`: l

const fixShebang = (l: string): string => l.startsWith('#!') ? '' : l

export const pipe: IExecPipe = (ctx): IContext => {
  const {
    name,
    entry,
    cache,
    tsconfig = [],
    customTypings = [],
    dtsOut,
    cwd,
  } = ctx

  let dts = tsconfig.map((cfg) => generate(cfg, cache, name)).join('\n\n')

  dts = mixFiles(globbySync(customTypings, {
    onlyFiles: true,
    absolute: true,
    cwd,
  }), dts)

  dts += `declare module '${name}' {
  /** */
  export * from '${name}/${entry}';
}`

  fse.outputFileSync(dtsOut, dts)

  return { ...ctx, dts }
}
