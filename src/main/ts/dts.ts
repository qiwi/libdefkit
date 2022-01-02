/** @module @qiwi/libdefkit */
/** */

import fs from 'fs-extra'
import { globbySync } from 'globby'
import { join } from 'path'

import { IContext, IExecPipe } from './interface'
import { invoke } from './util'

export const generate = (
  tsconfig: string,
  tempDir: string,
  name: string,
): void => {
  const cfg = fs.readJsonSync(tsconfig)
  const targetDir = cfg?.compilerOptions?.outDir
  const genDir = join(tempDir, 'gen', targetDir)
  const bundleDir = join(tempDir, 'bundle')
  const bundlePath = join(bundleDir, cfg?.compilerOptions?.target + '.d.ts')

  fs.ensureDirSync(genDir)
  fs.ensureDirSync(bundleDir)

  invoke({
    cmd: 'tsc',
    args: {
      p: tsconfig,
      declaration: true,
      emitDeclarationOnly: true,
      outDir: genDir,
    },
  })

  invoke({
    cmd: 'dts-bundle',
    args: {
      name: `${name}/${targetDir}`,
      main: join(genDir, 'index.d.ts'),
      out: bundlePath,
    },
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
  fs.outputFileSync(bundlePath, contents)
}

export const merge = (files: string[], memo = ''): string => files.reduce((m: string, f: string) =>
  m + fs.readFileSync(f, { encoding: 'utf-8' })
, memo)

export const pipe: IExecPipe = (ctx): IContext => {
  const { name, entry, cache, tsconfig = [], customTypings = [], dtsOut, cwd } = ctx

  tsconfig.forEach((cfg) => generate(cfg, cache, name))

  if (entry) {
    alias(entry, name, cache)
  }

  const files = [
    ...globbySync(['bundle/**/*.ts'], {onlyFiles: true, absolute: true, cwd: cache}),
    ...globbySync(customTypings, {onlyFiles: true, absolute: true, cwd})
  ]

  const dts = merge(files)

  if (dtsOut) {
    fs.outputFileSync(dtsOut, dts, {})
  }

  return { ...ctx, dts }
}
