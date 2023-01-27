# :droplet: dropCalc 

**Author:** Thomas Steimlé

## :speech_balloon: Description

Electron app based on [`electron-webpack`](https://github.com/electron-userland/electron-webpack) for easily generating results and enforcing guidelines of raw [`ddPCR`](https://en.wikipedia.org/wiki/Digital_polymerase_chain_reaction) [`QX200 Droplet Digital PCR System`](QX200 Droplet Digital PCR System) csv output.

## :sparkles: Getting Started
Simply clone down this repository, install dependencies, and get started on your application.

The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.

```bash
git clone https://github.com/Dr-TSteimle/dropCalc
cd dropCalc
rm -rf .git

# install dependencies
yarn

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```

Then open the app in the build directory


## :eyeglasses: Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
