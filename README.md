# @qiwi/libdefkit
Util toolset to produce single-file TS and Flow libdefs for Qiwi OSS projects

# Install
```shell script
yarn add @qiwi/libdefkit -D
```

# Usage
```json
{
  "scripts": {
    "build:libdef": "dtsgen --project ./ --out typings/index.d.ts --prefix @qiwi/libdefkit/target/es5 --name @qiwi/libdefkit --main @qiwi/libdefkit/target/es5/index --moduleResolution node && libdeffix --dts=./typings/index.d.ts --prefix=@qiwi/libdefkit/target/es5 && flowgen typings/index.d.ts --output-file flow-typed/index.flow.js"
  }
}
```
