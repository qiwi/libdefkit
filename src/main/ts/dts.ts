/** @module @qiwi/libdefkit */
/** */

import fse from 'fs-extra'
import { globbySync } from 'globby'
import { nanoid } from 'nanoid'
import { join } from 'path'

import { IContext, IExecPipe } from './interface'
import { invoke } from './util'

export const generate = (
  tsconfig: string,
  tempDir: string,
  name: string,
): void => {
  const cfg = fse.readJsonSync(tsconfig)
  const targetDir = cfg?.compilerOptions?.outDir
  const rand = nanoid()
  const genDir = join(tempDir, `libdefkit-${rand}/gen`, targetDir)
  const bundleDir = join(tempDir, `libdefkit-${rand}/bundle`)
  const bundlePath = join(bundleDir, cfg?.compilerOptions?.target + '.d.ts')

  fse.ensureDirSync(genDir)
  fse.ensureDirSync(bundleDir)

  invoke({
    cmd: 'tsc',
    args: {
      p: tsconfig,
      declaration: true,
      emitDeclarationOnly: true,
      outDir: genDir,
      noEmit: false,
    },
    closest: true,
  })

  invoke({
    cmd: 'dts-bundle',
    args: {
      name: `${name}/${targetDir}`,
      main: join(genDir, 'index.d.ts'),
      out: bundlePath,
    },
    closest: true,
  })
}

export const alias = (from: string, to: string, tempDir: string): void => {
  const bundleDir = join(tempDir, 'bundle')
  const bundlePath = join(bundleDir, 'entry.d.ts')
  const contents = `declare module '${to}' {
  /** */
  export * from '${from}';
}
`
  fse.outputFileSync(bundlePath, contents)
}

export const merge = (files: string[], memo = ''): string =>
  files.reduce(
    (m: string, f: string) => m + fse.readFileSync(f, { encoding: 'utf-8' }),
    memo,
  )

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

  tsconfig.forEach((cfg) => generate(cfg, cache, name))

  if (entry) {
    alias(entry, name, cache)
  }

  const files = [
    ...globbySync(['**/bundle/**/*.ts'], {
      onlyFiles: true,
      absolute: true,
      cwd: cache,
    }),
    ...globbySync(customTypings, { onlyFiles: true, absolute: true, cwd }),
  ]

  const dts = merge(files)

  if (dtsOut) {
    fse.outputFileSync(dtsOut, dts, {})
  }

  return { ...ctx, dts }
}
