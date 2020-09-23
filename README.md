# @qiwi/libdefkit
Util toolset to produce single-file TS and Flow libdefs for Qiwi OSS projects

## Install
```shell script
yarn add @qiwi/libdefkit -D
```

## Usage
Insert script to `package.json`.
```json
{
  "scripts": {
    "build:libdef": "libdefkit --tsconfig=tsconfig.es5.json --tsconfig=tsconfig.es6.json"
  }
}
```
