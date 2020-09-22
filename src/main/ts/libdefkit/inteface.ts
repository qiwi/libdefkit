import {StdioOptions} from 'child_process'

export type ICmdInvokeOptions = {
  cmd: string
  args?: string[] | Record<string, any>,
  cwd?: string,
  silent?: boolean,
  stdio?: StdioOptions,
  closest?: boolean
}
