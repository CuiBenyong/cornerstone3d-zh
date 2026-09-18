---
id: installation
title: 安装
description: 用 npm、yarn 或 pnpm 安装 Cornerstone3D 相关包，包括 @cornerstonejs/core、tools、dicom-image-loader、nifti-volume-loader，以及多态分割转换器所需的额外依赖。
keywords:
  - Cornerstone3D 安装
  - npm install cornerstonejs
  - "@cornerstonejs/core"
  - "@cornerstonejs/tools"
  - dicom-image-loader
  - polyseg-wasm
upstream: https://www.cornerstonejs.org/docs/getting-started/installation
---

# 安装

## NPM

你可以用 [npm](https://www.npmjs.com/) 安装 `Cornerstone3D`、`Cornerstone3DTools`
和 `StreamingImageVolumeLoader`。运行以下命令安装这些包的最新版本：

```bash
npm install @cornerstonejs/core
npm install @cornerstonejs/tools
npm install @cornerstonejs/dicom-image-loader
npm install @cornerstonejs/nifti-volume-loader

# 若要使用多态分割转换器，还需要安装下面这个包
npm install @icr/polyseg-wasm
```

## YARN

如果你使用 [Yarn](https://yarnpkg.com/)，运行以下命令安装：

```bash
yarn add @cornerstonejs/core
yarn add @cornerstonejs/tools
yarn add @cornerstonejs/dicom-image-loader
yarn add @cornerstonejs/nifti-volume-loader

# 若要使用多态分割转换器，还需要安装下面这个包
yarn add @icr/polyseg-wasm
```

## PNPM

如果你使用 [PNPM](https://pnpm.io)，可以按下面的方式安装。

若环境中还没有 `pnpm`，先启用 Corepack：

```bash
corepack enable
```

```bash
pnpm install @cornerstonejs/core
pnpm install @cornerstonejs/tools
pnpm install @cornerstonejs/dicom-image-loader
pnpm install @cornerstonejs/nifti-volume-loader

# 若要使用多态分割转换器，还需要安装下面这个包
pnpm install @icr/polyseg-wasm
```
