---
id: intro
title: 介绍
description: Cornerstone3D 教程的共同前提说明。介绍教程依赖的影像加载器、元数据提供者与库初始化步骤，以及如何用仓库内的 tutorial 示例在本地运行教程代码。
keywords:
  - Cornerstone3D 教程介绍
  - 本地运行教程
  - imageLoader
  - volumeLoader
  - 元数据提供者
  - yarn run example
upstream: https://www.cornerstonejs.org/docs/tutorials/intro
---

# 介绍

这篇介绍的目的，是把各篇教程**赖以运行**的那些组件交代清楚。

教程是面向学习的，很适合用来试各种功能，我们不希望你被实现细节分散注意力。
因此我们把教程里真正要学的那部分单独剥离出来（去掉了其他必要但无关的实现代码），
让你可以专注在学习本身。

:::note Info
教程完全面向学习，并且具体来说是面向「学会怎么做」而不是「了解是什么」。
（参见 [Cornerstone3D 的文档理念](https://documentation.divio.com/)）
:::

## 在本地运行教程

仓库里包含了一个 `tutorial` 示例，位置是 `packages/tools/examples/tutorial/index.ts`。
这个文件包含了在本地运行教程所需的全部准备代码（也就是上面说的那部分）。
打开它之后你会看到一处专门留出的位置，把教程里的代码复制粘贴进去即可。
这样你就不用操心准备工作，可以专注在教程内容上。

怎么运行？

```bash
# 在库的根目录下执行
yarn install --frozen-lockfile

# 运行 tutorial 示例
yarn run example tutorial
```

:::danger
一般来说，执行 `yarn install` 时都应该带上 `--frozen-lockfile` 标志，
通过强制依赖可复现来降低供应链攻击的风险。也就是说，只要 `yarn.lock` 是干净的、
没有引用被投毒的包，用这个标志就不会有被投毒的包落到你的机器上。
:::

然后在浏览器中打开一个新标签页，访问 `http://localhost:3000/`。

🎉 祝学习愉快 🎉

## 想深入了解的话

如果你好奇每篇教程背后都用到了哪些组件，下面是一份说明。

### 影像加载器

`Cornerstone3D` 本身不负责加载影像。后面会学到，`Cornerstone3D` 还能以任意方位
渲染**体数据**。因此需要把合适的影像加载器和体数据加载器注册到 `Cornerstone3D` 上，
它才能按预期工作。这类加载器的例子有：

- imageLoader：`cornerstoneDICOMImageLoader`
- volumeLoader：`cornerstoneStreamingImageVolumeLoader`

### 元数据提供者

为了让 `Cornerstone3D` 能正确显示影像的各项属性（例如 VOI、SUV 值等），
除影像数据本身之外它还需要元数据。因此需要把合适的元数据提供者注册到
`Cornerstone3D` 上，它才能按预期工作。这类提供者的例子有：

- metadataProvider：`cornerstoneDICOMImageLoader` 自带的元数据提供者，
  在调用其 `init()` 时会自行完成注册

:::note 说明

官方英文原文在这一小节只写了「这类提供者的例子有：」便结束了，没有列出具体条目。
上面给出的这一条来自 `cornerstoneDICOMImageLoader` 的实际行为，
供参考。关于元数据提供者的完整说明，见[元数据提供者](../1-concepts/cornerstone-core/metadataProvider.md)。

:::

### 库的初始化

`Cornerstone3D` 和 `Cornerstone3DTools` 都需要调用各自的 `.init()` 方法来完成初始化。
