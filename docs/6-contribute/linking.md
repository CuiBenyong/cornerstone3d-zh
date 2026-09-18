---
id: linking
title: 链接 Cornerstone 各库
description: 用 yarn link 把本地的 Cornerstone 库与 OHIF 链接起来做开发的分步指南，包括前置条件、单个与多个库的链接步骤、如何验证链接生效、排查改动不生效的思路，以及调试相关的几个实用技巧。
keywords:
  - yarn link
  - 本地联调
  - OHIF
  - 符号链接
  - source map
  - 调试
upstream: https://www.cornerstonejs.org/docs/contribute/linking
---

# 为开发而把 Cornerstone 各库与 OHIF 链接起来 {#linking-cornerstone-libraries-with-ohif-for-development}

你常常会需要把某个包链接到 Cornerstone3D 上——
可能是为了开发某个特性、调试某个缺陷，或者别的原因。

另外，有时你可能想链接那些「外部」包，
以便把一些并非直接依赖、而是动态加载的库也纳入你的构建。
细节见 externals/README.md 文件。

## Yarn Link {#yarn-link}

链接一个包有多种方式，最常见的是使用
[`yarn link`](https://classic.yarnpkg.com/en/docs/cli/link)。

本指南说明如何把本地的 Cornerstone 库链接起来，配合 OHIF 做开发。

## 前置条件 {#prerequisites}

- 本地已克隆 OHIF Viewer
- 本地已克隆所需的 Cornerstone 库（@cornerstonejs/core、@cornerstonejs/tools 等）
- Yarn 包管理器

## 链接库的步骤 {#steps-to-link-libraries}

1. **准备 Cornerstone 库**

   进入你想链接的那个 Cornerstone 库目录（例如 @cornerstonejs/core）：

   ```bash
   cd packages/core
   ```

   先解除任何已有的链接：

   ```bash
   yarn unlink
   ```

   创建链接：

   ```bash
   yarn link
   ```

   构建该包以确保用上最新改动：

   ```bash
   yarn dev
   ```

2. **在 OHIF 中链接**

   在你的 OHIF 项目目录下：

   ```bash
   yarn link @cornerstonejs/core
   ```

   启动 OHIF：

   ```bash
   yarn dev
   ```

## 同时处理多个库 {#working-with-multiple-libraries}

你可以同时链接多个 Cornerstone 库。例如同时链接 core 和 tools：

```bash
# 在 cornerstone/packages/core 下
yarn unlink
yarn link
yarn dev

# 在 cornerstone/packages/tools 下
yarn unlink
yarn link
yarn dev

# 在 OHIF 下
yarn link @cornerstonejs/core
yarn link @cornerstonejs/tools
```

## 验证链接是否生效 {#verifying-the-link}

1. 在被链接的库里做一处看得见的改动（例如改一下 tools 里某个线宽）
2. 用 `yarn dev` 重新构建该库
3. 改动应当会自动反映到 OHIF 中

## 需要注意的几点 {#important-notes}

- 每次在 Cornerstone 库里做了改动，都要执行一次 `yarn dev`
- 由于 Cornerstone 3D 2.0 迁移到了 ESM，链接过程比以前更简单了
- 用完之后，在两个项目里都执行 `yarn unlink` 解除链接

## 排查问题 {#troubleshooting}

如果改动没有生效：

1. 确认该库已经重新构建过（`yarn dev`）
2. 检查控制台是否有链接相关的报错
3. 在浏览器控制台中确认被链接的是正确的库版本

## 视频教程 {#video-tutorials}

<iframe width="560" height="315" src="https://www.youtube.com/embed/IOXQ1od6DZA?si=3QP4rppQgedJn7y8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 技巧 {#tips}

1. `yarn link` 实际上就是在包之间建立一个符号链接。如果链接不生效，
   可以去 `Cornerstone3D` 目录下的 `node_modules` 里看看符号链接是否已创建
   （`node_modules` 里能拿到的是更新后的**源码**，而不是 dist）。

2. 如果你的 `debugger` 断点没有命中，可以试着把 webpack 的 `mode`
   从 `production` 改成 `development`。这样源码就不会被压缩。

3. 调试时使用更详细的 source map。相关内容可以在
   [这里](https://webpack.js.org/configuration/devtool/)了解更多。
