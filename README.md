# @qiwi/libdefkit
Util toolset to produce single-file TS and Flow libdefs

## Requirements
Node.js >= 14

## Install
```shell script
yarn add @qiwi/libdefkit -D
```

## Usage
Insert script to `package.json`
```json
{
  "scripts": {
    "build:libdef": "libdefkit --tsconfig=tsconfig.es5.json --tsconfig=tsconfig.es6.json"
  }
}
```
## CLI
|Flag | Description | Default
|---|---|---
|`--help` | Display usage hints
|`--cwd` | Set current working dir | `process.cwd()` 
|`--entry` | Define pkg entry point | `<pkgName>/target/es5` 
|`--tsconfig` | Define path(s) to project's TS config
|`--customTypings` | Attach custom libdefs to d.ts bundle
|`--cache` | Dir for temporary assets | `tempy.directory()`
|`--dtsOut` | **TS** typings output | `typings/index.d.ts` 
|`--flowOut` | **Flow** libdef output | `flow-typed/index.flow.js`

## License
[MIT](./LICENSE)
