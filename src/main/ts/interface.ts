import {From, To} from 'replace-in-file'

export type IReplacer = {
  from: From
  to: To
}

export type IReplacerContext = {
  dtsData: string
  prefix: string
}

export type IRunnerOpts = {
  dts: string,
  prefix: string
}

export type IReplacerFactory = (cxt: IReplacerContext) => IReplacer
