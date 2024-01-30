/** @module @qiwi/libdefkit */

/** */
import fse from 'fs-extra'
import { globbySync } from 'globby'
import { generateDts } from 'tsc-dts-fix'
import { populateSync } from '@topoconfig/extends'

import { IContext, IExecPipe } from './interface.js'
import { findCommon } from './util.js'

export const generate = (
  tsconfig: string,
  name: string,
  cwd: string,
  entryPoints: Record<string, string> = {},
): string => {
  const cfg = populateSync(fse.readJsonSync(tsconfig), {
    merge: {
      compilerOptions: 'merge',
    }
  })

  const {
    include = [],
    compilerOptions: {
      outDir = '' ,
      rootDir = findCommon(globbySync(include, {
        onlyFiles: true,
        absolute: true,
        cwd,
      }))
    } = {},
  } = cfg

  return generateDts({
    input: rootDir + '/index.ts',
    strategy: 'bundle',
    pkgName: name,
    outDir,
    entryPoints,
    conceal: false,
    ext: '.js',
    cwd
  })['bundle.d.ts']
}

export const mixFiles = (files: string[], memo = ''): string =>
  files.reduce(
    (m: string, f: string) => m + "\n" + fse.readFileSync(f, { encoding: 'utf-8' }),
    memo,
  )

export const pipe: IExecPipe = (ctx): IContext => {
  const {
    name,
    entry,
    tsconfig = [],
    customTypings = [],
    dtsOut,
    cwd,
  } = ctx

  let dts = tsconfig.map((cfg, i) =>
    generate(
      cfg,
      name,
      cwd,
      i === 0 ? {'.': entry ?? './index.ts'} : {}
    ),
  ).join('\n\n')

  dts = mixFiles(globbySync(customTypings, {
    onlyFiles: true,
    absolute: true,
    cwd,
  }), dts)

  fse.outputFileSync(dtsOut, dts)

  return { ...ctx, dts }
}
