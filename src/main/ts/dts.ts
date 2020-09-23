import {invoke} from './util'
import fs from 'fs-extra'
import {join} from 'path'
import {IExecPipe} from './interface'

export const generate = (tsconfig: string, tempDir: string, name: string) => {
  const cfg = fs.readJsonSync(tsconfig)
  const targetDir = cfg?.compilerOptions?.outDir
  const genDir = join(tempDir, 'gen', targetDir)
  const bundleDir = join(tempDir, 'bundle')
  const bundlePath = join(bundleDir, cfg?.compilerOptions?.target + '.d.ts')

  invoke({cmd: 'mkdirp', args: [genDir, bundleDir]})

  invoke({cmd: 'tsc', args: {
    p: tsconfig,
    declaration: true,
    emitDeclarationOnly: true,
    outDir: genDir,
  }})

  invoke({cmd: 'dts-bundle', args: {
    name: `${name}/${targetDir}`,
    main: join(genDir, 'index.d.ts'),
    out: bundlePath,
  }})
}

// export const bundle = (name: string, baseDir: string) => {}

export const alias = (from: string, to: string, tempDir: string) => {
  const bundleDir = join(tempDir, 'bundle')
  const bundlePath = join(bundleDir, 'entry.d.ts')
  const contents = `
declare module '${to}' {
  /** */
  export * from '${from}';
}
`
  fs.writeFileSync(bundlePath, contents)
}

export const merge = (tempDir: string, dtsOut?: string): string => {
  const bundleDir = join(tempDir, 'bundle')
  const contents = fs.readdirSync(bundleDir)
    .reduce((m, f) => m + fs.readFileSync(join(bundleDir, f), {encoding: 'utf-8'}), '')

  dtsOut && fs.writeFileSync(dtsOut, contents)

  return contents
}

export const pipe: IExecPipe = (ctx) => {
  const {name, entry, cache, tsconfig = [], dtsOut} = ctx

  tsconfig.forEach(cfg => generate(cfg, cache, name))

  if (entry) {
    alias(entry, name, cache)
  }

  const dts = merge(cache, dtsOut)

  return {...ctx, dts}
}
